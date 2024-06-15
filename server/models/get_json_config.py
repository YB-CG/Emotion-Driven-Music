from keras.models import load_model

# Load your existing .h5 model
model = load_model('path_to_your_model.h5')

# Convert model configuration to JSON
model_json = model.to_json()

# Save JSON to a file
with open('model.json', 'w') as json_file:
    json_file.write(model_json)

print("Model JSON saved to model.json")
