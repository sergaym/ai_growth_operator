# python playground/own_models/text_image.py --prompt "Hyperrealistic portrait of a 35-year-old Middle Eastern man with a neatly trimmed beard, professional attire, neutral expression, studio lighting"

# python playground/own_models/text_image.py --gender female --age 28 --ethnicity "East Asian" --skin-tone light --hair-style long --hair-color black --expression "confident" --background "gradient" --lighting "soft studio"






# Basic usage with text input
python playground/own_models/text_speech.py --text "Hola, este es un ejemplo de texto a voz en español" --voice-preset female_1

# List available Spanish voices
python playground/own_models/text_speech.py --list-spanish-voices

# Generate speech from a text file with customized voice settings
python playground/own_models/text_speech.py --text-file script.txt --voice-preset male_1 --stability 0.3 --similarity-boost 0.8



python playground/own_models/image_to_video.py --image-path playground/own_models/avatar_1746310434_0.png --prompt "Realistic motion of person talking"

python playground/own_models/lipsync.py --video-path output/video_1746425642.mp4 --audio-path playground/own_models/speech_female_1_1746314883.mp3