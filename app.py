from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests

app = Flask(__name__)
CORS(app)

OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"}), 200

@app.route('/summarize', methods=['POST'])
def summarize():
    data = request.get_json()

    if not data or 'url' not in data:
        return jsonify({"error": "URL is required"}), 400

    url = data['url']

    if not OPENAI_API_KEY:
        return jsonify({"error": "OPENAI_API_KEY not configured"}), 500

    try:
        # Call OpenAI API to summarize the URL content
        headers = {
            'Authorization': f'Bearer {OPENAI_API_KEY}',
            'Content-Type': 'application/json'
        }

        payload = {
            'model': 'gpt-3.5-turbo',
            'messages': [
                {
                    'role': 'system',
                    'content': 'You are a helpful assistant that summarizes web pages concisely.'
                },
                {
                    'role': 'user',
                    'content': f'Please summarize the content at this URL: {url}'
                }
            ],
            'max_tokens': 150
        }

        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers=headers,
            json=payload,
            timeout=30
        )

        response.raise_for_status()
        result = response.json()

        summary = result['choices'][0]['message']['content']

        return jsonify({"summary": summary}), 200

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to call OpenAI API: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
