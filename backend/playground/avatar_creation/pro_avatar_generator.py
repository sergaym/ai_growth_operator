import os
import json
import base64
import openai
from dotenv import load_dotenv
from typing import Dict, List, Optional, Any, Tuple
import time

# Load environment variables
load_dotenv()

# Set up OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

