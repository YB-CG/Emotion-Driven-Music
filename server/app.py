from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import uuid
import numpy as np
import cv2
from keras.models import load_model
from keras.preprocessing.image import img_to_array

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all origins

# Set up paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')
DETECTION_MODEL_PATH = os.path.join(MODELS_DIR, 'haarcascade_frontalface_default.xml')
MODEL_WEIGHTS_FILE = os.path.join(MODELS_DIR, 'emotion_model.h5')
ORIGINAL_SAVE_DIR = os.path.join(BASE_DIR, 'original')
LABELED_SAVE_DIR = os.path.join(BASE_DIR, 'labeled')

if not os.path.exists(ORIGINAL_SAVE_DIR):
    os.makedirs(ORIGINAL_SAVE_DIR)
if not os.path.exists(LABELED_SAVE_DIR):
    os.makedirs(LABELED_SAVE_DIR)

# Load face detection model
face_detection = cv2.CascadeClassifier(DETECTION_MODEL_PATH)

# Load emotion classification model
emotion_classifier = load_model(MODEL_WEIGHTS_FILE)

# Emotion labels
EMOTIONS = ["Angry", "Disgust", "Fear", "Happy", "Neutral", "Sad", "Surprise"]

@app.route('/emotion-detection', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image part in the request"}), 400

    file = request.files['image']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Generate a unique filename
    unique_filename = str(uuid.uuid4()) + '.png'
    original_file_path = os.path.join(ORIGINAL_SAVE_DIR, unique_filename)
    file.save(original_file_path)

    # Read the image
    image = cv2.imread(original_file_path)

    if image is None:
        return jsonify({"error": "Invalid image file"}), 400

    # Detect faces in the image
    faces = face_detection.detectMultiScale(image, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30), flags=cv2.CASCADE_SCALE_IMAGE)

    if len(faces) == 0:
        return jsonify({"message": "No face detected"}), 200

    results = []

    # Process each face detected
    for (fX, fY, fW, fH) in faces:
        face = image[fY:fY + fH, fX:fX + fW]
        roi = cv2.resize(face, (48, 48))  # Resize to 48x48
        roi = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
        roi = roi.astype("float") / 255.0
        roi = img_to_array(roi)
        roi = np.expand_dims(roi, axis=0)

        preds = emotion_classifier.predict(roi)[0]
        label = EMOTIONS[np.argmax(preds)]
        results.append({"emotion": label})

        # Draw label and bounding box on the image
        cv2.putText(image, label, (fX, fY - 10), cv2.FONT_HERSHEY_DUPLEX, 1, (238, 164, 64), 1)
        cv2.rectangle(image, (fX, fY), (fX + fW, fY + fH), (238, 164, 64), 2)

    # Save the labeled image in the new directory
    labeled_filename = 'labeled_' + unique_filename
    labeled_image_path = os.path.join(LABELED_SAVE_DIR, labeled_filename)
    cv2.imwrite(labeled_image_path, image)

    return jsonify({
        "results": results,
        "original_image": os.path.join('original', unique_filename),
        "labeled_image": os.path.join('labeled', labeled_filename)
    }), 200

@app.route('/original/<filename>', methods=['GET'])
def get_original_image(filename):
    return send_from_directory(ORIGINAL_SAVE_DIR, filename)

@app.route('/labeled/<filename>', methods=['GET'])
def get_labeled_image(filename):
    return send_from_directory(LABELED_SAVE_DIR, filename)

if __name__ == '__main__':
    app.run(debug=True)
