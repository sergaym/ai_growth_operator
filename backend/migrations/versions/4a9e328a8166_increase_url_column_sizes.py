"""increase_url_column_sizes

Revision ID: 4a9e328a8166
Revises: 13c50fce74a3
Create Date: 2025-04-16 01:05:32.645683

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4a9e328a8166'
down_revision: Union[str, None] = '13c50fce74a3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Increase size of URL columns to 2000 characters
    op.alter_column('video_generations', 'video_url',
               existing_type=sa.VARCHAR(length=500),
               type_=sa.VARCHAR(length=2000),
               existing_nullable=True)
    
    op.alter_column('video_generations', 'preview_url',
               existing_type=sa.VARCHAR(length=500),
               type_=sa.VARCHAR(length=2000),
               existing_nullable=True)
    
    op.alter_column('video_generations', 'thumbnail_url',
               existing_type=sa.VARCHAR(length=500),
               type_=sa.VARCHAR(length=2000),
               existing_nullable=True)


def downgrade() -> None:
    # Return to original column sizes if needed
    op.alter_column('video_generations', 'video_url',
               existing_type=sa.VARCHAR(length=2000),
               type_=sa.VARCHAR(length=500),
               existing_nullable=True)
    
    op.alter_column('video_generations', 'preview_url',
               existing_type=sa.VARCHAR(length=2000),
               type_=sa.VARCHAR(length=500),
               existing_nullable=True)
    
    op.alter_column('video_generations', 'thumbnail_url',
               existing_type=sa.VARCHAR(length=2000),
               type_=sa.VARCHAR(length=500),
               existing_nullable=True)
