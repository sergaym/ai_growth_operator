# Actor Creation

This package contains tools for generating professional real actor images based on target audience analysis.

## Pro Actor Generator

The `ProActorGenerator` class creates images of realistic human actors specifically designed to resonate with a target audience for marketing and advertising purposes. The generator focuses exclusively on creating professional-looking human actors/models instead of fictional avatars.

### Features

- **Target Audience Analysis**: Analyzes audience demographics, psychographics, and visual preferences to match actors that will appeal to them
- **Brand Alignment**: Ensures actors reflect brand identity and values
- **Multiple Actor Types**: Supports various actor profiles (professional, casual/lifestyle, industry expert, aspirational, relatable)
- **Photorealistic Generation**: Creates images of real-looking human actors with professional photography qualities
- **Multiple Variations**: Generates different actor styles (standard, professional, friendly, dynamic)
- **Refinement Process**: Allows for iterative improvement based on feedback
- **Advertising Usage Tips**: Provides specific advice for using the actor in marketing campaigns

### Requirements
- OpenAI API key set in your environment variables
- `requests` package for image downloading

### Usage

```python
from avatar_creation.pro_avatar_generator import ProActorGenerator

# Create the generator
generator = ProActorGenerator(model="gpt-4-turbo", image_model="dall-e-3")

# Analyze audience and brand
generator.analyze_audience_and_brand(
    audience_description="Tech-savvy millennials, aged 25-35, with high disposable income, interested in fitness and sustainability, primarily urban residents who value authenticity and innovation.",
    brand_description="EcoFit is a sustainable fitness technology company focused on eco-friendly workout equipment and apps that help users track both fitness goals and their carbon footprint reduction."
)

# Generate actor variations
actors = generator.generate_actor_variations(num_variations=4)

# Select and refine the best actor
final_actor = generator.select_and_refine_actor()

# Get tips for using the actor in advertising
advertising_tips = generator.get_advertising_usage_tips()
print(advertising_tips)

# Access the final actor details
print(f"Actor image saved to: {final_actor['local_path']}")
```

Or run directly:
```
python -m avatar_creation.pro_avatar_generator
```

### Actor Types

The generator supports several actor types that can be selected based on audience and brand analysis:

1. **Professional**: Corporate professional with business attire, suitable for B2B services
2. **Casual/Lifestyle**: Approachable person with casual attire, for lifestyle and consumer products
3. **Industry Expert**: Authoritative figure with professional appearance specific to an industry
4. **Aspirational**: Successful, attractive person representing an ideal or aspiration
5. **Relatable Everyday Person**: Average, down-to-earth person that viewers can easily identify with

### Photo Quality Optimization

Generated actor images are optimized for professional quality by ensuring:

- Clear, natural facial features with good symmetry 
- Professional quality photography aesthetics
- Appropriate styling (clothing, accessories, grooming)
- Natural, flattering lighting
- Realistic skin textures and details
- Expressions and poses appropriate for advertising
- High-resolution and crisp details

### Output

The generator creates PNG images in the `avatar_creation/output` directory. Each generated actor includes:

- Image file saved locally
- Detailed prompt used to generate the image
- Actor type and variation style
- Original and refined versions (if refinement was performed) 