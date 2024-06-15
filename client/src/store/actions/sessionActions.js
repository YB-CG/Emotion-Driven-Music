import spotifyAxios from '../../axios/spotify';

export const setToken = token => {
  spotifyAxios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
  localStorage.setItem('token', token);
  return {
    type: 'SET_TOKEN',
    token
  };
};

export const setActiveDevice = id => {
  spotifyAxios.put('/me/player', { device_ids: [id], play: false });
  return { type: 'SET_DEVICE' };
};

export const setDeviceId = id => {
  return {
    type: 'SET_DEVICE_ID',
    id
  };
};
