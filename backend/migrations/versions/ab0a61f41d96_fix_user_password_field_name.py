"""fix user password field name

Revision ID: ab0a61f41d96
Revises: 7129ddd43ee3
Create Date: 2025-05-14 20:32:46.820952

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ab0a61f41d96'
down_revision: Union[str, None] = '7129ddd43ee3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('users', sa.Column('hashed_password', sa.String(length=255), nullable=False))
    op.drop_column('users', 'password')
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('users', sa.Column('password', sa.VARCHAR(length=255), autoincrement=False, nullable=False))
    op.drop_column('users', 'hashed_password')
    # ### end Alembic commands ###
