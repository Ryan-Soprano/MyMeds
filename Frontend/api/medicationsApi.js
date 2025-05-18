// src/api/medicationsApi.js
import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getMedications = async () => {
    try {
        const token = await AsyncStorage.getItem('access_token'); // or whatever key you're using
        const response = await apiClient.get('/medications/', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Get Medications error:", error.response?.data || error.message);
        throw error;
    }
};

export const getMedicationsForMedPage = async () => {
    try {
        const token = await AsyncStorage.getItem('access_token'); // or whatever key you're using
        const response = await apiClient.get('/medicationsmedpage/', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Get Medications error:", error.response?.data || error.message);
        throw error;
    }
};

export const saveMedication = async (medData) => {
    try {
      const response = await apiClient.post('/medications/', medData);
      return response.data;
    } catch (error) {
      console.error('Failed to save medication:', error.response?.data || error.message);
      throw error;
    }
  };


export const addMedication = async (userId, medicationData) => {
    try {
        const token = await AsyncStorage.getItem("token"); // Retrieve token from AsyncStorage
        const response = await apiClient.post(`/users/${userId}/medications/`, medicationData, {
            headers: {
                Authorization: `Bearer ${token}`, // Attach the token
            },
        });
        return response.data;
    } catch (error) {
        console.error("Add Medication error:", error.response?.data || error.message);
        throw error;
    }
};

export const uploadImage = async (imageUri) => {
    try {
        const formData = new FormData();
        formData.append('file', {
            uri: imageUri,
            name: 'photo.jpg',  // or extract the filename dynamically
            type: 'image/jpeg', // adjust if using PNG or another format
        });

        const response = await apiClient.post('/upload-image/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        console.error('Upload Image error:', error.response?.data || error.message);
        throw error;
    }
};