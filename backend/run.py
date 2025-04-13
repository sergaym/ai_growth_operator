"""
Development server runner
"""

import uvicorn

if __name__ == "__main__":
    # Run the app in development mode with auto-reload
    uvicorn.run(
        "app.main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True
    ) 