# python playground/own_models/text_image.py --prompt "Hyperrealistic portrait of a 35-year-old Middle Eastern man with a neatly trimmed beard, professional attire, neutral expression, studio lighting"

# python playground/own_models/text_image.py --gender female --age 28 --ethnicity "East Asian" --skin-tone light --hair-style long --hair-color black --expression "confident" --background "gradient" --lighting "soft studio"






# Basic usage with text input
python playground/own_models/text_speech.py --text "Hola, este es un ejemplo de texto a voz en español" --voice-preset female_1

# List available Spanish voices
python playground/own_models/text_speech.py --list-spanish-voices

# Generate speech from a text file with customized voice settings
python playground/own_models/text_speech.py --text-file script.txt --voice-preset male_1 --stability 0.3 --similarity-boost 0.8