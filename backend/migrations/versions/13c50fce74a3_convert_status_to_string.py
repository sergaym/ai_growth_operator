"""convert_status_to_string

Revision ID: 13c50fce74a3
Revises: fa7d417bd64b
Create Date: 2025-04-16 01:00:19.933404

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '13c50fce74a3'
down_revision: Union[str, None] = 'fa7d417bd64b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create a connection
    conn = op.get_bind()
    
    # Step 1: Create a new temporary column
    op.add_column('video_generations', sa.Column('status_str', sa.String(20), nullable=True))
    
    # Step 2: Copy data from the enum column to the string column
    conn.execute(sa.text("""
        UPDATE video_generations 
        SET status_str = status::text
    """))
    
    # Step 3: Set non-null constraint
    op.alter_column('video_generations', 'status_str', nullable=False)
    
    # Step 4: Drop the old column
    op.drop_column('video_generations', 'status')
    
    # Step 5: Rename the new column to the old column's name
    op.alter_column('video_generations', 'status_str', new_column_name='status')
    
    # Step 6: Set default value
    op.alter_column('video_generations', 'status', 
                   server_default='processing',
                   nullable=False)
    
    # Step 7: Drop the enum type if it exists
    conn.execute(sa.text('DROP TYPE IF EXISTS video_status'))


def downgrade() -> None:
    # For downgrade, we'll create an enum type and convert back
    conn = op.get_bind()
    
    # Step 1: Create the enum type
    conn.execute(sa.text("CREATE TYPE video_status AS ENUM ('processing', 'completed', 'failed', 'cancelled')"))
    
    # Step 2: Create a new temporary column with enum type
    op.add_column('video_generations', sa.Column('status_enum', 
                                                postgresql.ENUM('processing', 'completed', 'failed', 'cancelled',
                                                               name='video_status', create_type=False),
                                                nullable=True))
    
    # Step 3: Copy data
    conn.execute(sa.text("""
        UPDATE video_generations 
        SET status_enum = status::video_status
    """))
    
    # Step 4: Set non-null constraint
    op.alter_column('video_generations', 'status_enum', nullable=False)
    
    # Step 5: Drop the old column
    op.drop_column('video_generations', 'status')
    
    # Step 6: Rename the new column
    op.alter_column('video_generations', 'status_enum', new_column_name='status')
    
    # Step 7: Set default value
    op.alter_column('video_generations', 'status', 
                   server_default='processing',
                   nullable=False)
