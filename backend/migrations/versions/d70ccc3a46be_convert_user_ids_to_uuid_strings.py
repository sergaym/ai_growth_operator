"""convert_user_ids_to_uuid_strings

Revision ID: d70ccc3a46be
Revises: 9109d164b02e
Create Date: 2025-05-26 19:29:44.133925

"""
from typing import Sequence, Union
import uuid

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import text


# revision identifiers, used by Alembic.
revision: str = 'd70ccc3a46be'
down_revision: Union[str, None] = '9109d164b02e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def generate_uuid():
    """Generate a UUID string without dashes."""
    return str(uuid.uuid4().hex)


def upgrade() -> None:
    """
    Convert user IDs from integers to UUID strings and add proper foreign key constraints.
    This migration handles data cleanup and conversion in the correct order.
    """
    
    # Step 1: Clean up orphaned records in asset tables before adding FK constraints
    print("Cleaning up orphaned records in asset tables...")
    
    # Get connection for raw SQL operations
    connection = op.get_bind()
    
    # Clean up audio records with invalid workspace_ids
    connection.execute(text("""
        UPDATE audio 
        SET workspace_id = NULL, user_id = NULL 
        WHERE workspace_id IS NOT NULL 
        AND workspace_id NOT IN (SELECT id FROM workspaces)
    """))
    
    # Clean up other asset tables similarly
    for table in ['images', 'videos', 'lipsync_videos']:
        connection.execute(text(f"""
            UPDATE {table} 
            SET workspace_id = NULL, user_id = NULL 
            WHERE workspace_id IS NOT NULL 
            AND workspace_id NOT IN (SELECT id FROM workspaces)
        """))
    
    print("Orphaned records cleaned up.")
    
    # Step 2: Create a temporary mapping table for user ID conversion
    print("Creating user ID mapping...")
    
    op.create_table(
        'user_id_mapping_temp',
        sa.Column('old_id', sa.Integer, primary_key=True),
        sa.Column('new_id', sa.String, nullable=False)
    )
    
    # Generate new UUIDs for existing users and store the mapping
    result = connection.execute(text("SELECT id FROM users ORDER BY id"))
    user_mappings = {}
    for row in result:
        old_id = row[0]
        new_id = generate_uuid()
        user_mappings[old_id] = new_id
        connection.execute(
            text("INSERT INTO user_id_mapping_temp (old_id, new_id) VALUES (:old_id, :new_id)"),
            {'old_id': old_id, 'new_id': new_id}
        )
    
    print(f"Created mappings for {len(user_mappings)} users.")
    
    # Step 3: Drop existing foreign key constraints that reference users.id
    print("Dropping existing foreign key constraints...")
    
    # Drop FK constraints that reference users table
    try:
        op.drop_constraint('user_workspaces_user_id_fkey', 'user_workspaces', type_='foreignkey')
    except:
        pass
    try:
        op.drop_constraint('workspaces_owner_id_fkey', 'workspaces', type_='foreignkey')
    except:
        pass
    try:
        op.drop_constraint('projects_created_by_user_id_fkey', 'projects', type_='foreignkey')
    except:
        pass
    try:
        op.drop_constraint('payment_methods_user_id_fkey', 'payment_methods', type_='foreignkey')
    except:
        pass
    
    # Step 4: Drop indexes that will be recreated
    print("Dropping indexes...")
    try:
        op.drop_index('ix_projects_created_by_user_id', table_name='projects')
    except:
        pass
    try:
        op.drop_index('ix_projects_id', table_name='projects')
    except:
        pass
    try:
        op.drop_index('ix_projects_workspace_id', table_name='projects')
    except:
        pass
    
    # Step 5: Alter column types
    print("Altering column types...")
    
    # Alter users table first
    op.alter_column('users', 'id',
               existing_type=sa.INTEGER(),
               type_=sa.String(),
               existing_nullable=False,
               existing_server_default=sa.text("nextval('users_id_seq'::regclass)"))
    
    # Alter foreign key columns
    op.alter_column('user_workspaces', 'user_id',
               existing_type=sa.INTEGER(),
               type_=sa.String(),
               existing_nullable=False)
    
    op.alter_column('workspaces', 'owner_id',
               existing_type=sa.INTEGER(),
               type_=sa.String(),
               existing_nullable=False)
    
    op.alter_column('projects', 'created_by_user_id',
               existing_type=sa.INTEGER(),
               type_=sa.String(),
               existing_nullable=False)
    
    op.alter_column('payment_methods', 'user_id',
               existing_type=sa.INTEGER(),
               type_=sa.String(),
               existing_nullable=False)
    
    # Step 6: Update data with new UUIDs (now that columns are strings)
    print("Updating data with new UUIDs...")
    
    # Update users table first
    for old_id, new_id in user_mappings.items():
        connection.execute(
            text("UPDATE users SET id = :new_id WHERE id = :old_id"),
            {'new_id': new_id, 'old_id': str(old_id)}
        )
    
    # Update foreign key references using the mapping
    # Update user_workspaces.user_id
    connection.execute(text("""
        UPDATE user_workspaces 
        SET user_id = m.new_id
        FROM user_id_mapping_temp m
        WHERE user_workspaces.user_id = m.old_id::text
    """))
    
    # Update workspaces.owner_id
    connection.execute(text("""
        UPDATE workspaces 
        SET owner_id = m.new_id
        FROM user_id_mapping_temp m
        WHERE workspaces.owner_id = m.old_id::text
    """))
    
    # Update projects.created_by_user_id
    connection.execute(text("""
        UPDATE projects 
        SET created_by_user_id = m.new_id
        FROM user_id_mapping_temp m
        WHERE projects.created_by_user_id = m.old_id::text
    """))
    
    # Update payment_methods.user_id
    connection.execute(text("""
        UPDATE payment_methods 
        SET user_id = m.new_id
        FROM user_id_mapping_temp m
        WHERE payment_methods.user_id = m.old_id::text
    """))
    
    # Update asset tables user_id (only for valid references)
    for table in ['images', 'videos', 'audio', 'lipsync_videos']:
        connection.execute(text(f"""
            UPDATE {table} 
            SET user_id = m.new_id
            FROM user_id_mapping_temp m
            WHERE {table}.user_id = m.old_id::text
        """))
    
    # Step 7: Recreate foreign key constraints (now that data is clean and types are correct)
    print("Adding foreign key constraints...")
    
    # Recreate FK constraints for user references
    op.create_foreign_key('user_workspaces_user_id_fkey', 'user_workspaces', 'users', ['user_id'], ['id'])
    op.create_foreign_key('workspaces_owner_id_fkey', 'workspaces', 'users', ['owner_id'], ['id'])
    op.create_foreign_key('projects_created_by_user_id_fkey', 'projects', 'users', ['created_by_user_id'], ['id'])
    op.create_foreign_key('payment_methods_user_id_fkey', 'payment_methods', 'users', ['user_id'], ['id'])
    
    # Add FK constraints for asset tables
    op.create_foreign_key(None, 'images', 'workspaces', ['workspace_id'], ['id'])
    op.create_foreign_key(None, 'videos', 'workspaces', ['workspace_id'], ['id'])
    op.create_foreign_key(None, 'audio', 'workspaces', ['workspace_id'], ['id'])
    op.create_foreign_key(None, 'lipsync_videos', 'workspaces', ['workspace_id'], ['id'])
    
    # Add user FK constraints for asset tables
    op.create_foreign_key(None, 'images', 'users', ['user_id'], ['id'])
    op.create_foreign_key(None, 'videos', 'users', ['user_id'], ['id'])
    op.create_foreign_key(None, 'audio', 'users', ['user_id'], ['id'])
    op.create_foreign_key(None, 'lipsync_videos', 'users', ['user_id'], ['id'])
    
    # Step 8: Drop the sequence for users table (no longer needed)
    op.execute("DROP SEQUENCE IF EXISTS users_id_seq CASCADE")
    
    # Step 9: Clean up temporary mapping table
    op.drop_table('user_id_mapping_temp')
    
    print("Migration completed successfully!")


def downgrade() -> None:
    """
    Downgrade is not supported as it would require converting UUIDs back to integers
    which could cause data loss and referential integrity issues.
    """
    raise NotImplementedError(
        "Downgrade from UUID user IDs to integer IDs is not supported as it could cause "
        "data loss. Please restore from backup if needed."
    )
