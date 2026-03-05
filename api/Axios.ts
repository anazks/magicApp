import axios from 'axios';

// Using the same config approach as magicLamp
// Assuming backend is running locally. For Android emulator, use 10.0.2.2 instead of localhost
// For iOS simulator or physical device, use your local IP address (e.g., 192.168.x.x)
const API_URL = 'https://magiclaptest.pythonanywhere.com/'; // Change to specific backend URL if needed

const instance = axios.create({
  baseURL: API_URL,
});

instance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async function (error) {
    return Promise.reject(error);
  }
);

export default instance;
