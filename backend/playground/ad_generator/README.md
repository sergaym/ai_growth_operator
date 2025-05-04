# Ad Generator

This package contains different implementations of commercial ad generators using OpenAI's models.

## Versions

### Simple Ad Generator (`simple.py`)

A basic implementation that generates a commercial ad script based on provided company description, target audience, and product description.

#### Usage
```python
from ad_generator.simple import generate_commercial_ad

ad_script = generate_commercial_ad(
    company_description="Company description",
    target_audience="Target audience description",
    product_description="Product description",
    model="gpt-4-turbo"  # Optional, defaults to "gpt-4-turbo"
)

print(ad_script)
```

Or run directly:
```
python -m ad_generator.simple
```

### Ad Generator Agent (`agent.py`)

An advanced implementation that functions as an expert agent for creating high-quality commercial ads. The agent:

1. Asks follow-up questions to better understand the company, audience, and product
2. Gathers detailed information through an interactive Q&A process
3. Generates a highly targeted and effective ad based on the enriched information
4. Allows for refinement based on user feedback

#### Usage
```python
from ad_generator.agent import AdGeneratorAgent

# Create an agent instance
agent = AdGeneratorAgent(model="gpt-4-turbo")  # Optional, defaults to "gpt-4-turbo"

# Gather information through interactive process
agent.gather_information(
    company_description="Initial company description",  # Optional
    target_audience="Initial target audience",  # Optional
    product_description="Initial product description"  # Optional
)

# Generate the ad
ad_script = agent.generate_ad()
print(ad_script)

# Optionally refine the ad based on feedback
refined_ad = agent.refine_ad("Make it more emotional and add sound effects")
print(refined_ad)
```

Or run directly:
```
python -m ad_generator.agent
```

### Advanced Ad Generator Agent (`advanced_agent.py`)

A professional-grade implementation designed to function like an expert content director, incorporating:

1. Multi-turn reasoning with adaptive questioning
2. Structured information extraction
3. Industry-specific knowledge
4. Competitor analysis
5. Professional creative brief generation
6. Multiple ad variation generation and comparison
7. Ad evaluation and refinement

#### Usage
```python
from ad_generator.advanced_agent import AdvancedAdGeneratorAgent

# Create an advanced agent instance
agent = AdvancedAdGeneratorAgent(model="gpt-4-turbo")  # Optional, defaults to "gpt-4-turbo"

# Conduct comprehensive information gathering
creative_brief = agent.gather_information()

# Generate multiple ad variations
ad_variations = agent.generate_ad_variations(num_variations=3)

# Select and refine the best variation
final_ad = agent.select_and_refine_ad()
```

Or run directly:
```
python -m ad_generator.advanced_agent
```

## Requirements
- OpenAI API key set in your environment variables or `.env` file 