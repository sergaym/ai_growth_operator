"""remove_legacy_video_tables

Revision ID: 31ba90da303b
Revises: 5749d60da90f
Create Date: 2025-05-20 07:10:34.717911

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '31ba90da303b'
down_revision: Union[str, None] = '5749d60da90f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Drop the legacy video tables that are no longer used."""
    
    # First drop the heygen_avatar_videos table which has a foreign key to video_generations
    op.drop_table('heygen_avatar_videos')
    
    # Then drop the video_generations table
    op.drop_table('video_generations')


def downgrade() -> None:
    """Recreate the tables if we need to downgrade."""
    
    # Recreate the video_generations table
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
    
    # Create an index for the generation_id
    op.create_index(op.f('ix_video_generations_generation_id'), 'video_generations', ['generation_id'], unique=True)
    
    # Create the heygen_avatar_videos table
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
    
    # Create an index for the avatar_id
    op.create_index(op.f('ix_heygen_avatar_videos_avatar_id'), 'heygen_avatar_videos', ['avatar_id'], unique=False)
