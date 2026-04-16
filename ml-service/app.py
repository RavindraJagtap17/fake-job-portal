from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# Load model and vectorizer
print("Loading ML model...")
with open('model.pkl', 'rb') as f:
    model = pickle.load(f)

with open('vectorizer.pkl', 'rb') as f:
    vectorizer = pickle.load(f)

print("Model loaded successfully!")

@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'Fake Job Detection ML Service is running!'})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        # Get job details from request
        job_title = data.get('jobTitle', '')
        company = data.get('companyName', '')
        description = data.get('description', '')
        salary = data.get('salary', '')

        # Combine all text
        text = f"{job_title} {company} {description} {salary}"

        if not text.strip():
            return jsonify({'error': 'No text provided'}), 400

        # Transform text using vectorizer
        text_tfidf = vectorizer.transform([text])

        # Get prediction
        prediction = model.predict(text_tfidf)[0]

        # Get confidence percentage
        probabilities = model.predict_proba(text_tfidf)[0]
        confidence = round(float(max(probabilities)) * 100, 2)

        result = 'FAKE' if prediction == 1 else 'REAL'

        return jsonify({
            'result': result,
            'confidence': confidence,
            'fake_probability': round(float(probabilities[1]) * 100, 2),
            'real_probability': round(float(probabilities[0]) * 100, 2)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)