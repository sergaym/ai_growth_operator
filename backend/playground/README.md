# Backend Playground

This directory contains experimental Python scripts for testing different functionalities.

## Ad Generator

The `ad_generator.py` script creates commercial ad scripts (max 1 minute) using OpenAI's GPT-4 model.

### Requirements
- OpenAI API key set in your environment variables

### Usage
1. Make sure you have an OpenAI API key set in your environment:
   ```
   export OPENAI_API_KEY=your-api-key
   ```
   Or create a `.env` file in the root directory with:
   ```
   OPENAI_API_KEY=your-api-key
   ```

2. Run the script:
   ```
   python ad_generator.py
   ```

3. Follow the prompts to enter:
   - Company description
   - Target audience
   - Product description

4. The script will generate a 1-minute commercial ad script based on your inputs.

### Example Input
- **Company**: "EcoTech Solutions is a sustainable technology company focused on reducing carbon footprints through innovative smart home devices."
- **Target Audience**: "Environmentally conscious homeowners aged 30-45 with above-average income who value technology and sustainability."
- **Product**: "The EcoSmart Thermostat learns your habits and automatically adjusts temperature settings to minimize energy usage while maintaining comfort, saving users an average of 30% on heating and cooling costs." 