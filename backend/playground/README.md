# Backend Playground

This directory contains experimental Python scripts for testing different functionalities.

## Modules

### Ad Generator

The `ad_generator` package contains implementations for generating commercial advertisements using OpenAI's models.

#### Versions Available:
- **Simple Ad Generator**: Basic implementation that generates ads based on company, audience, and product descriptions.
- **Ad Generator Agent**: Advanced implementation that acts as an expert agent, asking follow-up questions to create higher-quality ads.
- **Advanced Ad Generator**: Professional-grade implementation that functions like an expert content director.

See the [Ad Generator README](ad_generator/README.md) for more details.

### Avatar Creation

The `avatar_creation` package contains tools for generating professional avatar images based on target audience analysis.

#### Features:
- Target audience analysis to create audience-resonant avatars
- Brand alignment to ensure avatars reflect brand identity
- Multiple avatar variations (standard, professional, friendly, creative)
- Refinement process for iterative improvement

See the [Avatar Creation README](avatar_creation/README.md) for more details.

### Requirements
- OpenAI API key set in your environment variables

### Usage
For ad generation:
```
python -m ad_generator.simple
python -m ad_generator.agent
python -m ad_generator.advanced_agent
```

For avatar creation:
```
python -m avatar_creation.pro_avatar_generator
``` 