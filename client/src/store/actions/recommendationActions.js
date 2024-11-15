import spotifyAxios from '../../axios/spotify';
import emotionAxios from '../../axios/emotion';

// Action creators
const fetchRecommendationsPending = () => ({
  type: 'FETCH_RECOMMENDATIONS_PENDING'
});

const fetchRecommendationsSuccess = (data, emotion) => ({
  type: 'FETCH_RECOMMENDATIONS_SUCCESS',
  data,
  emotion
});

const fetchRecommendationsError = error => ({
  type: 'FETCH_RECOMMENDATIONS_ERROR',
  error
});

// Function to capture an image using the webcam
const captureImage = async () => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        video.srcObject = stream;
        video.play();
        video.addEventListener('loadeddata', () => {
          // Set canvas size to match video dimensions
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          // Draw the video frame to the canvas
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          // Stop the video stream
          video.srcObject.getTracks().forEach(track => track.stop());
          // Convert the canvas to a data URL (base64 string)
          const imageDataUrl = canvas.toDataURL('image/png');
          resolve(imageDataUrl);
        });
      })
      .catch(reject);
  });
};

// Function to send the captured image to the emotion detection API
const detectEmotion = async (imageDataUrl) => {
  const formData = new FormData();
  // Convert data URL to Blob
  const response = await fetch(imageDataUrl);
  const blob = await response.blob();
  formData.append('image', blob, 'image.png');

  console.log('Sending request to emotion detection API...');
  const emotionResponse = await emotionAxios.post('/emotion-detection', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  // Extract emotion from the correct path in the response
  const detectedEmotion = emotionResponse.data.results[0].emotion.toLowerCase();
  console.log('Emotion API Response:', detectedEmotion);
  
  // save response in localstorage
  localStorage.setItem('emotion', detectedEmotion);
  console.log('Emotion saved in localStorage:', localStorage.getItem('emotion'));
  
  return detectedEmotion;
};
// Utility function to get a random element from an array
const getRandomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

// Function to get random values within a range
const getRandomValueInRange = (min, max) => {
  return (Math.random() * (max - min)) + min;
};

// Function to map emotions to recommendation parameters
const getRecommendationParams = (emotion) => {
  const params = {
    happy: {
      genres: ['pop', 'dance', 'hip-hop'],
      energy: [0.7, 1.0],
      valence: [0.7, 1.0]
    },
    sad: {
      genres: ['acoustic', 'singer-songwriter', 'classical'],
      energy: [0.1, 0.4],
      valence: [0.1, 0.4]
    },
    angry: {
      genres: ['rock', 'metal', 'punk'],
      energy: [0.6, 1.0],
      valence: [0.0, 0.3]
    },
    surprised: {
      genres: ['electronic', 'experimental', 'indie'],
      energy: [0.6, 0.9],
      valence: [0.6, 0.9]
    },
    neutral: {
      genres: ['jazz', 'blues', 'folk'],
      energy: [0.4, 0.6],
      valence: [0.4, 0.6]
    },
    disgusted: {
      genres: ['metal', 'hardcore', 'industrial'],
      energy: [0.5, 0.8],
      valence: [0.2, 0.5]
    },
    fear: {
      genres: ['ambient', 'soundtrack', 'minimal'],
      energy: [0.1, 0.3],
      valence: [0.1, 0.3]
    }
  };

  const selectedParams = params[emotion] || params['neutral'];
  const seed_genres = getRandomElement(selectedParams.genres);
  const target_energy = getRandomValueInRange(...selectedParams.energy);
  const target_valence = getRandomValueInRange(...selectedParams.valence);

  return { seed_genres, target_energy, target_valence };
};

// Updated thunk action to fetch recommendations
export const fetchRecommendations = () => {
  return async (dispatch, getState) => {
    dispatch(fetchRecommendationsPending());
    console.log('Starting recommendations fetch...');

    const token = getState().sessionReducer.token;

    try {
      const imageBlob = await captureImage();
      console.log('Image captured successfully');
      
      const emotion = await detectEmotion(imageBlob);
      console.log('Emotion detected:', emotion);
      console.log('Current localStorage emotion:', localStorage.getItem('emotion'));
      
      const { seed_genres, target_energy, target_valence } = getRecommendationParams(emotion);
      console.log('Recommendation params:', { seed_genres, target_energy, target_valence });

      const response = await spotifyAxios.get('/recommendations', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          seed_genres,
          target_energy,
          target_valence
        }
      });

      console.log('Recommendations received, dispatching success with emotion:', emotion);
      dispatch(fetchRecommendationsSuccess(response.data.tracks, emotion));
    } catch (error) {
      console.error('Error in fetchRecommendations:', error);
      dispatch(fetchRecommendationsError(error));
    }
  };
};