"""merge_video_cleanup_heads

Revision ID: 3f4ba02cd07c
Revises: 63f8df1bded3, 3125ae37153c
Create Date: 2025-05-26 19:17:29.817165

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3f4ba02cd07c'
down_revision: Union[str, None] = ('63f8df1bded3', '3125ae37153c')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
