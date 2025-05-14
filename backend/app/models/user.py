from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.db.base_class import Base

user_workspace_association = Table(
    'user_workspace_association',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('user.id')),
    Column('workspace_id', Integer, ForeignKey('workspace.id')),
)

class User(Base):
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    workspaces = relationship('Workspace', secondary=user_workspace_association, back_populates='users')

class Workspace(Base):
    __tablename__ = 'workspace'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # 'private' or 'company'
    owner_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    users = relationship('User', secondary=user_workspace_association, back_populates='workspaces')
    owner = relationship('User', foreign_keys=[owner_id])
