"""reset_video_tables

Revision ID: fa7d417bd64b
Revises: 52f2d2f5402b
Create Date: 2025-04-16 00:35:13.607767

"""
from typing import Sequence, Union
from datetime import datetime

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'fa7d417bd64b'
down_revision: Union[str, None] = '52f2d2f5402b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop the tables and enum types in the correct order to avoid dependency issues
    
    # Use SQL commands directly with IF EXISTS to avoid errors
    conn = op.get_bind()
    
    # Drop foreign key constraints
    conn.execute(sa.text("""
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name='heygen_avatar_videos_video_generation_id_fkey'
            ) THEN
                ALTER TABLE heygen_avatar_videos DROP CONSTRAINT heygen_avatar_videos_video_generation_id_fkey;
            END IF;
        END
        $$;
    """))
    
    # First drop heygen_avatar_videos which depends on video_generations
    conn.execute(sa.text('DROP TABLE IF EXISTS heygen_avatar_videos'))
    # Then drop video_generations
    conn.execute(sa.text('DROP TABLE IF EXISTS video_generations'))
    
    # For enum types, we need to drop dependent columns first,
    # but since we've already dropped the tables, we can now drop the enum
    conn.execute(sa.text('DROP TYPE IF EXISTS video_status'))
    
    # Create enum type with lowercase values
    conn.execute(sa.text("CREATE TYPE video_status AS ENUM ('processing', 'completed', 'failed', 'cancelled')"))
    
    # Create video_generations table
    op.create_table('video_generations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('generation_id', sa.String(length=100), nullable=False),
        sa.Column('prompt', sa.Text(), nullable=False),
        sa.Column('status', postgresql.ENUM('processing', 'completed', 'failed', 'cancelled', name='video_status', create_type=False), nullable=False, server_default='processing'),
        sa.Column('model', sa.String(length=50), nullable=False),
        sa.Column('duration', sa.String(length=20), nullable=False),
        sa.Column('aspect_ratio', sa.String(length=10), nullable=False),
        sa.Column('provider', sa.String(length=50), nullable=False),
        sa.Column('video_url', sa.String(length=500), nullable=True),
        sa.Column('preview_url', sa.String(length=500), nullable=True),
        sa.Column('thumbnail_url', sa.String(length=500), nullable=True),
        sa.Column('metadata_json', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index(op.f('ix_video_generations_generation_id'), 'video_generations', ['generation_id'], unique=True)
    op.create_index(op.f('ix_video_generations_id'), 'video_generations', ['id'], unique=False)
    
    # Create heygen_avatar_videos table
    op.create_table('heygen_avatar_videos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('video_generation_id', sa.Integer(), nullable=False),
        sa.Column('avatar_id', sa.String(length=100), nullable=False),
        sa.Column('avatar_name', sa.String(length=100), nullable=True),
        sa.Column('avatar_style', sa.String(length=50), nullable=False, server_default='normal'),
        sa.Column('voice_id', sa.String(length=100), nullable=False),
        sa.Column('voice_speed', sa.Float(), nullable=False, server_default=sa.text('1.0')),
        sa.Column('voice_pitch', sa.Integer(), nullable=False, server_default=sa.text('0')),
        sa.Column('width', sa.Integer(), nullable=False, server_default=sa.text('1280')),
        sa.Column('height', sa.Integer(), nullable=False, server_default=sa.text('720')),
        sa.Column('background_color', sa.String(length=20), nullable=False, server_default='#f6f6fc'),
        sa.Column('processing_time', sa.Float(), nullable=True),
        sa.Column('gender', sa.String(length=20), nullable=True),
        sa.Column('language', sa.String(length=50), nullable=True),
        sa.Column('callback_url', sa.String(length=500), nullable=True),
        sa.Column('error_details', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['video_generation_id'], ['video_generations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index(op.f('ix_heygen_avatar_videos_avatar_id'), 'heygen_avatar_videos', ['avatar_id'], unique=False)
    op.create_index(op.f('ix_heygen_avatar_videos_id'), 'heygen_avatar_videos', ['id'], unique=False)


def downgrade() -> None:
    # Warning: This downgrade will lose all data
    # Drop tables in reverse order
    conn = op.get_bind()
    
    # Drop foreign key constraints first
    conn.execute(sa.text("""
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name='heygen_avatar_videos_video_generation_id_fkey'
            ) THEN
                ALTER TABLE heygen_avatar_videos DROP CONSTRAINT heygen_avatar_videos_video_generation_id_fkey;
            END IF;
        END
        $$;
    """))
    
    # Drop tables
    conn.execute(sa.text('DROP TABLE IF EXISTS heygen_avatar_videos'))
    conn.execute(sa.text('DROP TABLE IF EXISTS video_generations'))
    
    # Drop enum type
    conn.execute(sa.text('DROP TYPE IF EXISTS video_status'))
