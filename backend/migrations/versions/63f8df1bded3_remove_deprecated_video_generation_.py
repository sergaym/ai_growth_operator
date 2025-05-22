"""remove_deprecated_video_generation_models

Revision ID: 63f8df1bded3
Revises: eb9418eecae1
Create Date: 2025-05-22 23:02:35.972377

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '63f8df1bded3'
down_revision: Union[str, None] = 'eb9418eecae1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop tables in correct order due to foreign key constraints
    # Drop child table (heygen_avatar_videos) first, then parent table (video_generations)
    
    # Drop heygen_avatar_videos table and its indexes first
    op.drop_index('ix_heygen_avatar_videos_avatar_id', table_name='heygen_avatar_videos')
    op.drop_index('ix_heygen_avatar_videos_id', table_name='heygen_avatar_videos')
    op.drop_table('heygen_avatar_videos')
    
    # Then drop video_generations table and its indexes
    op.drop_index('ix_video_generations_generation_id', table_name='video_generations')
    op.drop_index('ix_video_generations_id', table_name='video_generations')
    op.drop_table('video_generations')


def downgrade() -> None:
    # Recreate tables in correct order (parent first, then child)
    # Note: This downgrade is for rollback capability only - these tables should not be used in new development
    
    # Create video_generations table first (parent table)
    op.create_table('video_generations',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('generation_id', sa.VARCHAR(length=100), autoincrement=False, nullable=False),
    sa.Column('prompt', sa.TEXT(), autoincrement=False, nullable=False),
    sa.Column('status', sa.VARCHAR(length=20), autoincrement=False, nullable=False),
    sa.Column('model', sa.VARCHAR(length=50), autoincrement=False, nullable=False),
    sa.Column('duration', sa.VARCHAR(length=20), autoincrement=False, nullable=False),
    sa.Column('aspect_ratio', sa.VARCHAR(length=10), autoincrement=False, nullable=False),
    sa.Column('provider', sa.VARCHAR(length=50), autoincrement=False, nullable=False),
    sa.Column('video_url', sa.VARCHAR(length=2000), autoincrement=False, nullable=True),
    sa.Column('preview_url', sa.VARCHAR(length=2000), autoincrement=False, nullable=True),
    sa.Column('thumbnail_url', sa.VARCHAR(length=2000), autoincrement=False, nullable=True),
    sa.Column('metadata_json', postgresql.JSON(astext_type=sa.Text()), autoincrement=False, nullable=True),
    sa.Column('created_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=False),
    sa.Column('updated_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=False),
    sa.Column('completed_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
    sa.PrimaryKeyConstraint('id', name='video_generations_pkey')
    )
    op.create_index('ix_video_generations_id', 'video_generations', ['id'], unique=False)
    op.create_index('ix_video_generations_generation_id', 'video_generations', ['generation_id'], unique=True)
    
    # Then create heygen_avatar_videos table (child table)
    op.create_table('heygen_avatar_videos',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('video_generation_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('avatar_id', sa.VARCHAR(length=100), autoincrement=False, nullable=False),
    sa.Column('avatar_name', sa.VARCHAR(length=100), autoincrement=False, nullable=True),
    sa.Column('avatar_style', sa.VARCHAR(length=50), autoincrement=False, nullable=False),
    sa.Column('voice_id', sa.VARCHAR(length=100), autoincrement=False, nullable=False),
    sa.Column('voice_speed', sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=False),
    sa.Column('voice_pitch', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('width', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('height', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('background_color', sa.VARCHAR(length=20), autoincrement=False, nullable=False),
    sa.Column('processing_time', sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=True),
    sa.Column('gender', sa.VARCHAR(length=20), autoincrement=False, nullable=True),
    sa.Column('language', sa.VARCHAR(length=50), autoincrement=False, nullable=True),
    sa.Column('callback_url', sa.VARCHAR(length=500), autoincrement=False, nullable=True),
    sa.Column('error_details', postgresql.JSON(astext_type=sa.Text()), autoincrement=False, nullable=True),
    sa.Column('created_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=False),
    sa.Column('updated_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['video_generation_id'], ['video_generations.id'], name='heygen_avatar_videos_video_generation_id_fkey'),
    sa.PrimaryKeyConstraint('id', name='heygen_avatar_videos_pkey')
    )
    op.create_index('ix_heygen_avatar_videos_id', 'heygen_avatar_videos', ['id'], unique=False)
    op.create_index('ix_heygen_avatar_videos_avatar_id', 'heygen_avatar_videos', ['avatar_id'], unique=False)
