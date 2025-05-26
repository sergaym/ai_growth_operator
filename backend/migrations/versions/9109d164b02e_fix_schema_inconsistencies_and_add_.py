"""fix_schema_inconsistencies_and_add_projects

Revision ID: 9109d164b02e
Revises: 3f4ba02cd07c
Create Date: 2025-05-26 19:17:36.283955

"""
from typing import Sequence, Union
import uuid

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision: str = '9109d164b02e'
down_revision: Union[str, None] = '3f4ba02cd07c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Fix schema inconsistencies:
    1. Convert workspace IDs from INTEGER to STRING (UUID)
    2. Add projects table
    3. Update all foreign key references
    4. Migrate existing data
    """
    
    # Step 1: Create a temporary mapping table for workspace ID conversion
    op.execute(text("""
        CREATE TEMPORARY TABLE workspace_id_mapping (
            old_id INTEGER,
            new_id VARCHAR(32)
        )
    """))
    
    # Step 2: Generate new UUID-based IDs for existing workspaces and populate mapping
    connection = op.get_bind()
    workspaces = connection.execute(text("SELECT id FROM workspaces ORDER BY id")).fetchall()
    
    for workspace in workspaces:
        old_id = workspace[0]
        new_id = uuid.uuid4().hex
        connection.execute(
            text("INSERT INTO workspace_id_mapping (old_id, new_id) VALUES (:old_id, :new_id)"),
            {"old_id": old_id, "new_id": new_id}
        )
    
    # Step 3: Add new_id column to workspaces table
    op.add_column('workspaces', sa.Column('new_id', sa.String(32), nullable=True))
    
    # Step 4: Update workspaces with new UUID IDs
    op.execute(text("""
        UPDATE workspaces 
        SET new_id = workspace_id_mapping.new_id 
        FROM workspace_id_mapping 
        WHERE workspaces.id = workspace_id_mapping.old_id
    """))
    
    # Step 5: Add new_workspace_id column to user_workspaces table
    op.add_column('user_workspaces', sa.Column('new_workspace_id', sa.String(32), nullable=True))
    
    # Step 6: Update user_workspaces with new workspace IDs
    op.execute(text("""
        UPDATE user_workspaces 
        SET new_workspace_id = workspace_id_mapping.new_id 
        FROM workspace_id_mapping 
        WHERE user_workspaces.workspace_id = workspace_id_mapping.old_id
    """))
    
    # Step 7: Update subscriptions table workspace_id references
    op.add_column('subscriptions', sa.Column('new_workspace_id', sa.String(32), nullable=True))
    op.execute(text("""
        UPDATE subscriptions 
        SET new_workspace_id = workspace_id_mapping.new_id 
        FROM workspace_id_mapping 
        WHERE subscriptions.workspace_id = workspace_id_mapping.old_id
    """))
    
    # Step 8: Update payment_methods table workspace_id references
    op.add_column('payment_methods', sa.Column('new_workspace_id', sa.String(32), nullable=True))
    op.execute(text("""
        UPDATE payment_methods 
        SET new_workspace_id = workspace_id_mapping.new_id 
        FROM workspace_id_mapping 
        WHERE payment_methods.workspace_id = workspace_id_mapping.old_id
    """))
    
    # Step 9: Update invoices table workspace_id references
    op.add_column('invoices', sa.Column('new_workspace_id', sa.String(32), nullable=True))
    op.execute(text("""
        UPDATE invoices 
        SET new_workspace_id = workspace_id_mapping.new_id 
        FROM workspace_id_mapping 
        WHERE invoices.workspace_id = workspace_id_mapping.old_id
    """))
    
    # Step 10: Drop foreign key constraints
    op.drop_constraint('user_workspaces_workspace_id_fkey', 'user_workspaces', type_='foreignkey')
    op.drop_constraint('subscriptions_workspace_id_fkey', 'subscriptions', type_='foreignkey')
    op.drop_constraint('payment_methods_workspace_id_fkey', 'payment_methods', type_='foreignkey')
    op.drop_constraint('invoices_workspace_id_fkey', 'invoices', type_='foreignkey')
    
    # Step 11: Drop old columns
    op.drop_column('user_workspaces', 'workspace_id')
    op.drop_column('subscriptions', 'workspace_id')
    op.drop_column('payment_methods', 'workspace_id')
    op.drop_column('invoices', 'workspace_id')
    op.drop_column('workspaces', 'id')
    
    # Step 12: Rename new columns to original names
    op.alter_column('workspaces', 'new_id', new_column_name='id')
    op.alter_column('user_workspaces', 'new_workspace_id', new_column_name='workspace_id')
    op.alter_column('subscriptions', 'new_workspace_id', new_column_name='workspace_id')
    op.alter_column('payment_methods', 'new_workspace_id', new_column_name='workspace_id')
    op.alter_column('invoices', 'new_workspace_id', new_column_name='workspace_id')
    
    # Step 13: Make the new ID columns NOT NULL
    op.alter_column('workspaces', 'id', nullable=False)
    op.alter_column('user_workspaces', 'workspace_id', nullable=False)
    op.alter_column('subscriptions', 'workspace_id', nullable=False)
    op.alter_column('payment_methods', 'workspace_id', nullable=False)
    op.alter_column('invoices', 'workspace_id', nullable=False)
    
    # Step 14: Add primary key and indexes back
    op.create_primary_key('workspaces_pkey', 'workspaces', ['id'])
    op.create_index('ix_workspaces_id', 'workspaces', ['id'], unique=False)
    
    # Step 15: Recreate foreign key constraints
    op.create_foreign_key('user_workspaces_workspace_id_fkey', 'user_workspaces', 'workspaces', ['workspace_id'], ['id'])
    op.create_foreign_key('subscriptions_workspace_id_fkey', 'subscriptions', 'workspaces', ['workspace_id'], ['id'])
    op.create_foreign_key('payment_methods_workspace_id_fkey', 'payment_methods', 'workspaces', ['workspace_id'], ['id'])
    op.create_foreign_key('invoices_workspace_id_fkey', 'invoices', 'workspaces', ['workspace_id'], ['id'])
    
    # Step 16: Create projects table
    op.create_table('projects',
        sa.Column('id', sa.String(32), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('workspace_id', sa.String(32), nullable=False),
        sa.Column('created_by_user_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(20), nullable=False, default='draft'),
        sa.Column('thumbnail_url', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('last_activity_at', sa.DateTime(), nullable=False),
        sa.Column('metadata_json', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['workspace_id'], ['workspaces.id'], ),
        sa.ForeignKeyConstraint(['created_by_user_id'], ['users.id'], )
    )
    op.create_index('ix_projects_id', 'projects', ['id'], unique=False)
    op.create_index('ix_projects_workspace_id', 'projects', ['workspace_id'], unique=False)
    op.create_index('ix_projects_created_by_user_id', 'projects', ['created_by_user_id'], unique=False)
    
    # Step 17: Update asset tables to use string workspace_id (if they have workspace_id columns)
    # Note: Based on the models, assets have workspace_id as String but nullable
    # We'll ensure they're properly typed as String
    
    # For images table
    try:
        op.alter_column('images', 'workspace_id', type_=sa.String(), nullable=True)
    except Exception:
        pass  # Column might not exist or already be correct type
    
    # For videos table  
    try:
        op.alter_column('videos', 'workspace_id', type_=sa.String(), nullable=True)
    except Exception:
        pass
    
    # For audio table
    try:
        op.alter_column('audio', 'workspace_id', type_=sa.String(), nullable=True)
    except Exception:
        pass
    
    # For lipsync_videos table
    try:
        op.alter_column('lipsync_videos', 'workspace_id', type_=sa.String(), nullable=True)
    except Exception:
        pass


def downgrade() -> None:
    """
    Downgrade is complex and potentially destructive.
    This would require converting UUIDs back to integers and could cause data loss.
    """
    # Drop projects table
    op.drop_index('ix_projects_created_by_user_id', table_name='projects')
    op.drop_index('ix_projects_workspace_id', table_name='projects')
    op.drop_index('ix_projects_id', table_name='projects')
    op.drop_table('projects')
    
    # Note: Converting UUIDs back to integers is complex and potentially destructive
    # This downgrade is provided for completeness but should be used with extreme caution
    # in production environments as it could cause data loss
    
    raise NotImplementedError(
        "Downgrade from UUID workspace IDs to integer IDs is not supported "
        "as it could cause data loss. Please restore from backup if needed."
    )
