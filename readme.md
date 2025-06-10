# AI Growth Operator

A platform for AI-powered content generation with video, audio, and image creation capabilities.

## Features

- **Text-to-Image**: Generate images from text descriptions
- **Text-to-Speech**: Convert text to realistic speech audio  
- **Video Generation**: Create videos from text prompts
- **Image-to-Video**: Transform static images into dynamic videos
- **Lipsync**: Synchronize lip movements in videos with audio tracks
- **User Management**: Authentication and subscription management

## Project Structure

```
ai-ugc/
├── backend/           # FastAPI backend API
│   ├── app/
│   │   ├── api/v1/   # API endpoints
│   │   ├── core/     # Configuration
│   │   ├── db/       # Database models and connections
│   │   ├── services/ # External API integrations
│   │   └── schemas/  # Request/response models
│   └── requirements.txt
└── frontend/         # Next.js frontend
    ├── src/
    │   ├── app/      # Next.js app router
    │   └── components/ # React components
    └── package.json
```

## Quick Start

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables:**
   Create a `.env` file with your API keys:
   ```env
   OPENAI_API_KEY=your_openai_key
   ELEVENLABS_API_KEY=your_elevenlabs_key
   RUNWAY_API_KEY=your_runway_key
   HEYGEN_API_KEY=your_heygen_key
   DATABASE_URL=your_database_url
   SECRET_KEY=your_secret_key
   ```

4. **Run the API:**
   ```bash
   uvicorn app.main:app --reload
   ```

   API will be available at http://localhost:8000
   - Documentation: http://localhost:8000/api/docs
   - Interactive API: http://localhost:8000/api/redoc

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

   Frontend will be available at http://localhost:3000

## API Endpoints

### Core Features
- `POST /api/v1/text-to-image/generate` - Generate images from text
- `POST /api/v1/text-to-speech/generate` - Convert text to speech
- `POST /api/v1/video-generation/generate` - Generate videos from prompts
- `POST /api/v1/image-to-video/generate` - Create videos from images
- `POST /api/v1/lipsync/generate` - Synchronize lip movements with audio

### User Management
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User authentication
- `GET /api/v1/subscriptions/` - Manage user subscriptions

## Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: Database ORM with async support
- **PostgreSQL**: Primary database
- **Pydantic**: Data validation and serialization

### Frontend  
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives

### AI Services
- **OpenAI**: Text generation and processing
- **ElevenLabs**: Text-to-speech synthesis
- **Runway**: Video generation
- **HeyGen**: Avatar creation and lipsync

## Docker Deployment

### Backend
```bash
cd backend
docker build -t ai-ugc-backend .
docker run -p 8000:80 --env-file .env ai-ugc-backend
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

## Environment Variables

### Required
- `OPENAI_API_KEY` - OpenAI API access
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT token signing

### Optional (by feature)
- `ELEVENLABS_API_KEY` - Text-to-speech
- `RUNWAY_API_KEY` - Video generation  
- `HEYGEN_API_KEY` - Avatar and lipsync
- `STRIPE_API_KEY` - Payment processing

## Development

1. **Database migrations:**
   ```bash
   cd backend
   alembic upgrade head
   ```

2. **Add new migration:**
   ```bash
   alembic revision --autogenerate -m "description"
   ```

3. **Run tests:**
   ```bash
   # Backend
   cd backend
   pytest

   # Frontend  
   cd frontend
   npm test
   ```

## License

MIT License - see LICENSE file for details.
