// src/api/usersApi.js
import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const signup = async (username, password) => {
    try {
        const response = await apiClient.post('/users/', { username, password });
        return response.data;
    } catch (error) {
        console.error("Signup error:", error.response?.data || error.message);
        throw error;
    }
};

export const login = async (username, password) => {
    try {
        const response = await apiClient.post('/login/', { username, password });
        return response.data;
    } catch (error) {
        console.error("Login error:", error.response?.data || error.message);
        throw error;
    }
};

export const connectDependent = async (dependentId) => {
    try {
        const token = await AsyncStorage.getItem('access_token'); // Retrieve token from AsyncStorage
        const response = await apiClient.post('/connect/', { dependent_id: dependentId }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Connect Dependent error:", error.response?.data || error.message);
        throw error;
    }
}