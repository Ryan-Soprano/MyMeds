// src/api/apiClient.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.0.2.2:8000';  // Replace with your FastAPI server URL

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to request headers
apiClient.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("access_token"); // Retrieve token from AsyncStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Attach token to headers
    }
    return config;
  });

export default apiClient;
