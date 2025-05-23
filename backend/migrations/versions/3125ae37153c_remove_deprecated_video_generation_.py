"""remove_deprecated_video_generation_models

Revision ID: 3125ae37153c
Revises: 31ba90da303b
Create Date: 2025-05-22 23:00:04.232616

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '3125ae37153c'
down_revision: Union[str, None] = '31ba90da303b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Remove deprecated video generation tables."""
    # Drop tables if they exist (in correct order due to foreign key constraints)
    op.execute("DROP TABLE IF EXISTS heygen_avatar_videos CASCADE")
    op.execute("DROP TABLE IF EXISTS video_generations CASCADE")


def downgrade() -> None:
    """Recreate deprecated video generation tables (for rollback purposes only)."""
    # Note: This downgrade is provided for rollback capability but these tables
    # should not be used in new development. Use the Video model instead.
    
    # Recreate video_generations table
    op.create_table('video_generations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('generation_id', sa.String(length=100), nullable=False),
        sa.Column('prompt', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('model', sa.String(length=50), nullable=False),
        sa.Column('duration', sa.String(length=20), nullable=False),
        sa.Column('aspect_ratio', sa.String(length=10), nullable=False),
        sa.Column('provider', sa.String(length=50), nullable=False),
        sa.Column('video_url', sa.String(length=2000), nullable=True),
        sa.Column('preview_url', sa.String(length=2000), nullable=True),
        sa.Column('thumbnail_url', sa.String(length=2000), nullable=True),
        sa.Column('metadata_json', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_video_generations_generation_id', 'video_generations', ['generation_id'], unique=True)
    
    # Recreate heygen_avatar_videos table
    op.create_table('heygen_avatar_videos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('video_generation_id', sa.Integer(), nullable=False),
        sa.Column('avatar_id', sa.String(length=100), nullable=False),
        sa.Column('avatar_name', sa.String(length=100), nullable=True),
        sa.Column('avatar_style', sa.String(length=50), nullable=False),
        sa.Column('voice_id', sa.String(length=100), nullable=False),
        sa.Column('voice_speed', sa.Float(), nullable=False),
        sa.Column('voice_pitch', sa.Integer(), nullable=False),
        sa.Column('width', sa.Integer(), nullable=False),
        sa.Column('height', sa.Integer(), nullable=False),
        sa.Column('background_color', sa.String(length=20), nullable=False),
        sa.Column('processing_time', sa.Float(), nullable=True),
        sa.Column('gender', sa.String(length=20), nullable=True),
        sa.Column('language', sa.String(length=50), nullable=True),
        sa.Column('callback_url', sa.String(length=500), nullable=True),
        sa.Column('error_details', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['video_generation_id'], ['video_generations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_heygen_avatar_videos_avatar_id', 'heygen_avatar_videos', ['avatar_id'], unique=False)
