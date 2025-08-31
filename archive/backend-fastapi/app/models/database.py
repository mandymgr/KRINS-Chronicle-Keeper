"""
SQLAlchemy database models for Dev Memory OS
"""

import uuid
from datetime import datetime
from typing import Optional, List, Any
from sqlalchemy import (
    Column, String, Text, Integer, DateTime, Boolean, JSON, 
    ForeignKey, UniqueConstraint, Index
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class User(Base):
    """User model for authentication and ownership"""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    projects = relationship("Project", back_populates="owner")
    adrs = relationship("ADR", back_populates="author")
    patterns = relationship("Pattern", back_populates="author")
    search_queries = relationship("SearchQuery", back_populates="user")


class Project(Base):
    """Project model for organizing ADRs and patterns"""
    __tablename__ = "projects"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text)
    repository_url = Column(String(500))
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="projects")
    adrs = relationship("ADR", back_populates="project")


class ADR(Base):
    """Architecture Decision Record model"""
    __tablename__ = "adrs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    number = Column(Integer, nullable=False)
    title = Column(String(200), nullable=False, index=True)
    status = Column(String(20), nullable=False, default="draft", index=True)
    
    # ADR content fields
    problem_statement = Column(Text)
    alternatives = Column(JSON)
    decision = Column(Text)
    rationale = Column(Text)
    evidence = Column(JSON)
    
    # Full-text search
    embedding_text = Column(Text)
    
    # Metadata
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    project = relationship("Project", back_populates="adrs")
    author = relationship("User", back_populates="adrs")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint("project_id", "number", name="uq_project_adr_number"),
        Index("idx_adrs_status_created", "status", "created_at"),
    )


class Pattern(Base):
    """Design pattern model"""
    __tablename__ = "patterns"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)
    description = Column(Text, nullable=False)
    
    # Pattern guidance
    when_to_use = Column(Text)
    when_not_to_use = Column(Text)
    context_tags = Column(JSON)
    
    # Implementation details
    implementation_examples = Column(JSON)
    anti_patterns = Column(JSON)
    metrics = Column(JSON)
    security_considerations = Column(Text)
    
    # Full-text search
    embedding_text = Column(Text)
    
    # Pattern analytics
    effectiveness_score = Column(Integer, default=0)
    usage_count = Column(Integer, default=0)
    
    # Metadata
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    version = Column(Integer, default=1)
    status = Column(String(20), default="active", index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    author = relationship("User", back_populates="patterns")
    
    # Indexes
    __table_args__ = (
        Index("idx_patterns_category_status", "category", "status"),
    )


class SearchQuery(Base):
    """Search query analytics model"""
    __tablename__ = "search_queries"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"))
    
    # Query details
    query_text = Column(Text, nullable=False)
    search_type = Column(String(20), default="semantic", index=True)
    
    # Results and analytics
    results_found = Column(Integer, default=0)
    clicked_result_id = Column(UUID(as_uuid=True))
    satisfaction_rating = Column(Integer)
    response_time_ms = Column(Integer)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    user = relationship("User", back_populates="search_queries")
    project = relationship("Project")