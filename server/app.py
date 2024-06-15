from flask import Flask, request, jsonify, send_from_directory
import os
import uuid
import numpy as np
import cv2
from keras.models import model_from_json
from keras.preprocessing.image import img_to_array
import tensorflow as tf

# Initialize Flask app
app = Flask(__name__)

# Set up paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')
DETECTION_MODEL_PATH = os.path.join(MODELS_DIR, 'haarcascade_frontalface_default.xml')
MODEL_JSON_FILE = os.path.join(MODELS_DIR, 'model.json')
MODEL_WEIGHTS_FILE = os.path.join(MODELS_DIR, 'model_weights.h5')
SAVE_DIR = os.path.join(BASE_DIR, 'saved')

if not os.path.exists(SAVE_DIR):
    os.makedirs(SAVE_DIR)

# Configure TensorFlow
config = tf.compat.v1.ConfigProto()
config.gpu_options.per_process_gpu_memory_fraction = 0.15
session = tf.compat.v1.Session(config=config)
tf.compat.v1.keras.backend.set_session(session)

# Load face detection model
face_detection = cv2.CascadeClassifier(DETECTION_MODEL_PATH)

# Load emotion classification model
with open(MODEL_JSON_FILE, "r") as json_file:
    loaded_model_json = json_file.read()
    emotion_classifier = model_from_json(loaded_model_json)
    emotion_classifier.load_weights(MODEL_WEIGHTS_FILE)

# Emotion labels
EMOTIONS = ["Angry", "Disgust", "Fear", "Happy", "Neutral", "Sad", "Surprise"]

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image part in the request"}), 400

    file = request.files['image']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Generate a unique filename
    unique_filename = str(uuid.uuid4()) + '.' + file.filename.split('.')[-1]
    file_path = os.path.join(SAVE_DIR, unique_filename)
    file.save(file_path)

    # Read the image
    image = cv2.imread(file_path)

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
        roi = cv2.resize(face, (64, 64))
        roi = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
        roi = roi.astype("float") / 255.0
        roi = img_to_array(roi)
        roi = np.expand_dims(roi, axis=0)

        with session.as_default():
            with session.graph.as_default():
                preds = emotion_classifier.predict(roi)[0]

        label = EMOTIONS[preds.argmax()]
        results.append({"face": (fX, fY, fW, fH), "emotion": label})

        # Draw label and bounding box on the image
        cv2.putText(image, label, (fX, fY - 10), cv2.FONT_HERSHEY_DUPLEX, 1, (238, 164, 64), 1)
        cv2.rectangle(image, (fX, fY), (fX + fW, fY + fH), (238, 164, 64), 2)

    # Save the labeled image
    labeled_filename = 'labeled_' + unique_filename
    labeled_image_path = os.path.join(SAVE_DIR, labeled_filename)
    cv2.imwrite(labeled_image_path, image)

    return jsonify({
        "results": results,
        "original_image": file_path,
        "labeled_image": labeled_image_path
    }), 200

@app.route('/saved/<filename>', methods=['GET'])
def get_image(filename):
    return send_from_directory(SAVE_DIR, filename)

if __name__ == '__main__':
    app.run(debug=True)
