import axios from 'axios';

const emotionPath = 'http://localhost:5000';

const emotionInstance = axios.create({
  baseURL: emotionPath,
  headers: {}
});

export default emotionInstance;
