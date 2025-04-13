# 🚀 AI Growth Operator

[![Status](https://img.shields.io/badge/Status-Development-yellow)](https://github.com/username/ai-ugc)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

> An intelligent agent that runs and optimizes user acquisition campaigns end-to-end, learning and adapting without manual intervention.

## 📋 Overview

The **AI Growth Operator** is a sophisticated AI agent that automates and optimizes the entire digital marketing workflow:

1. **Ideation**: Takes an initial idea or value proposition as input
2. **Content Creation**: Automatically generates ad creatives (texts, images, videos)
3. **Campaign Launch**: 
   - Connects to major ad platforms (Meta, Google, TikTok, etc.)
   - Defines target audiences based on analytics
   - Deploys campaigns with optimal parameters

4. **Continuous Optimization**:
   - Monitors performance metrics in real-time
   - Creates new content when engagement declines
   - Dynamically adjusts audience segments based on performance data
   - Automatically optimizes budget allocation for maximum ROI

## 🔍 Key Features

- **End-to-End Automation**: From concept to optimization with minimal human intervention
- **Multi-Platform Integration**: Seamless connection with all major advertising platforms
- **Adaptive Learning**: Continuously improves based on campaign performance
- **Dynamic Content Generation**: Creates new ad variants based on performance data
- **AI Video Generation**: Creates professional-quality videos from text prompts
- **Budget Optimization**: Automatically adjusts spending to maximize ROI

## 🏗️ Project Structure

```
ai-ugc/
├── frontend/                  # Next.js frontend application
│   ├── src/
│   │   ├── app/               # Next.js app router structure
│   │   │   └── page.tsx       # Main landing page
│   │   ├── components/
│   │   │   ├── landing/       # Landing page components
│   │   │   │   ├── Hero.tsx       # Hero section component
│   │   │   │   ├── Features.tsx   # Key features section
│   │   │   │   ├── Workflow.tsx   # Workflow explainer section
│   │   │   │   ├── Demo.tsx       # Interactive demo section
│   │   │   │   ├── TechStack.tsx  # Technology showcase
│   │   │   │   └── Footer.tsx     # Footer component
│   │   │   └── ui/            # Reusable UI components
│   │   └── lib/               # Utility functions and helpers
│   ├── public/                # Static assets
│   └── package.json           # Frontend dependencies
│
├── backend/                   # Python backend services
│   ├── video_generator/       # Video generation module
│   │   ├── __init__.py
│   │   └── luma_generator.py  # Luma AI integration
│   ├── utils/                 # Utility functions
│   ├── config/                # Configuration files
│   ├── playground.py          # Interactive testing script
│   └── requirements.txt       # Python dependencies
│
└── README.md                  # Project documentation
```

## 🚀 Getting Started

### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Set up the Python virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Configure your API key:
   - Create a `.env` file in the backend directory
   - Add your Luma AI API key: `LUMAAI_API_KEY=your_api_key_here`

4. Run the playground script:
   ```
   python playground.py
   ```

## 🔗 Related Resources

*Coming soon...*

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

# AI Growth Operator - Video Generation Backend

This module provides a backend implementation for the "AI Growth Operator" platform's video generation capabilities.

## Features

- Generate videos from text prompts
- Support for different video styles and camera motions
- Automatic prompt enhancement
- Multiple resolution and duration options
- Supports looping videos
- Local video storage

## Technology Stack

- **Python**: Core programming language
- **Luma AI API**: Used for video generation
- **Python-dotenv**: For environment variable management
- **Requests**: For HTTP operations

## Getting Started

### Prerequisites

- Python 3.8+
- Luma AI API key (get one from [Luma AI](https://lumalabs.ai/dream-machine/api/keys))

### Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd ai-ugc
   ```

2. Set up the Python virtual environment:
   ```
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Configure your API key:
   - Create a `.env` file in the project root
   - Add your Luma AI API key: `LUMAAI_API_KEY=your_api_key_here`

### Usage

Run the playground script to test video generation:

```
python playground.py
```

Follow the interactive prompts to:
1. Enter a base prompt
2. Select a video style
3. Choose a camera motion
4. Add any additional details
5. Set video parameters (duration, resolution, looping)

The generated video will be saved to the `output/videos` directory.


## Future Enhancements

- Support for image-to-video generation
- Integration with ad platform APIs
- Audience targeting capabilities
- Performance monitoring and analytics
- Automatic campaign optimization

## License

MIT License - See LICENSE file for details.
