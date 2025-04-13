"""
Schema package for the AI Growth Operator API.
This module re-exports all schemas for backward compatibility.
"""

# Idea generation schemas
from .idea_schemas import (
    IdeaRequest,
    IdeaResponse,
    RefineIdeaRequest,
    RefineIdeaResponse,
    LanguageAdaptRequest,
    LanguageAdaptResponse,
)

# Marketing schemas (legacy, for backward compatibility)
from .marketing_schemas import (
    MarketingIdeaRequest,
    MarketingIdeaResponse,
)

# Video schemas
from .video_schemas import (
    VideoPromptRequest,
    VideoPromptResponse,
)

# Styles schemas
from .styles_schemas import StylesResponse 