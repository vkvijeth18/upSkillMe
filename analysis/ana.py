import json
import re

# Your raw input string with console output and JSON
raw_input = """C:\\Users\\vinee\\AppData\\Local\\Programs\\Python\\Python310\\lib\\site-packages\\imageio_ffmpeg\\binaries\\ffmpeg-win-x86_64-v7.1.exe -i C:\\Users\\vinee\\Desktop\\VIJETH\\UpskilMe\\temp\\video_1745420961.mp4 -loglevel error -f image2pipe -vf scale=640:480 -sws_flags bicubic -pix_fmt rgb24 -vcodec rawvideo -
MoviePy - Writing audio in C:\\Users\\vinee\\Desktop\\VIJETH\\UpskilMe\\temp\\audio_1745420961.wav
MoviePy - Done.
{"score": 41, "summary": "Overall Interview Performance: 41/100\\n\\n\\u2022 Confidence: 3.4/10 (Pitch variation: 0.8, Energy level: High, Silence: 64.0%)\\n\\u2022 Speech Clarity: 3.0/10 (Avg sentence length: 2.0 words, Complex sentences: 0, Vocabulary diversity: 0.50)\\n\\u2022 Filler Words: 0 total, 0.0% of speech\\n\\u2022 Emotional Tone: Neutral (Sentiment polarity: 0.0)\\n\\u2022 Speaking Rate: 5.3 words per minute\\n\\nRecommendations:\\n\\u2022 Work on speaking with more confidence by varying your tone and increasing energy.\\n\\u2022 Improve clarity by using shorter sentences and more diverse vocabulary.\\n\\u2022 Try to increase your speaking pace slightly for better engagement.", "recommendations": ["Work on speaking with more confidence by varying your tone and increasing energy.", "Improve clarity by using shorter sentences and more diverse vocabulary.", "Try to increase your speaking pace slightly for better engagement."], "confidence_score": 3.4, "clarity_score": 3.0, "filler_word_rate": 0.0, "emotion": "neutral", "speech_rate": 5.3}"""

# Find the JSON part using regex
json_match = re.search(r'\{.*\}', raw_input, re.DOTALL)
if json_match:
    json_str = json_match.group(0)
    
    # Parse the JSON
    try:
        parsed_data = json.loads(json_str)
        print("Successfully parsed JSON data:")
        print(json.dumps(parsed_data, indent=2))
        
        # Now you can access specific fields
        print("\nScore:", parsed_data["score"])
        print("Confidence score:", parsed_data["confidence_score"])
        print("Recommendations:", parsed_data["recommendations"])
        
    except json.JSONDecodeError as e:
        print("Error parsing JSON:", e)
else:
    print("No JSON data found in the input")