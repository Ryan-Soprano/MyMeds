// src/api/remindersApi.js
import apiClient from './apiClient';

export const addReminder = async (userId, medId, times, days) => {
    try {
        const response = await apiClient.post(`/users/${userId}/medications/${medId}/reminders/`, {
            times,
            days
        });
        return response.data;
    } catch (error) {
        console.error("Add Reminder error:", error.response?.data || error.message);
        throw error;
    }
};

export const getReminder = async (userId, medId) => {
    try {
        const response = await apiClient.get(`/users/${userId}/medications/${medId}/reminders/`);
        return response.data;
    } catch (error) {
        console.error("Get Reminder error:", error.response?.data || error.message);
        throw error;
    }
};