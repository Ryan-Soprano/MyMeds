import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Button } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from '@react-native-picker/picker';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveMedication } from "../../api/medicationsApi"; // Import API call

const MedicationScheduleScreen = ({route, navigation}) => {
    const initialData = route.params?.medication || {};
    const [daySelection, setDaySelection] = useState('');
    const [selectedDays, setSelectedDays] = useState([]);
    const [timesPerDay, setTimesPerDay] = useState(initialData?.frequency?.toString() || "1");
    const [timePickers, setTimePickers] = useState([null]);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [currentPickerIndex, setCurrentPickerIndex] = useState(null);

    const parseDateOnly = (dateValue) => {
        if (!dateValue) return null;
        const dateString = typeof dateValue === 'string' ? dateValue : dateValue.toISOString().split('T')[0];
        const [year, month, day] = dateString.split('-');
        return new Date(year, month - 1, day);
    };
    

    const [medication] = useState({
        name: initialData.name || '',
        dosage: initialData.dosage || '',
        quantity: initialData.quantity || '',
        startDate: initialData.startDate ? parseDateOnly(initialData.startDate) : new Date(),
        endDate: initialData.endDate ? parseDateOnly(initialData.endDate) : null,
        instructions: initialData.instructions || '',
      });
    
    const [pillSettings] = useState({
        pillShape: initialData.pillShape || "pills",
        pillColor: initialData.pillColor || "#757575",
        pillColorLeft: initialData.pillColorLeft || "#757575",
        pillColorRight: initialData.pillColorRight || "#757575",
        backgroundColor: initialData.backgroundColor || "#D9D9D9",
    });

    const toggleDay = (day) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    const showDatePicker = (index) => {
        setCurrentPickerIndex(index);
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        const updatedPickers = [...timePickers];
        updatedPickers[currentPickerIndex] = date;
        setTimePickers(updatedPickers);
        hideDatePicker();
    };

    const handleTimesChange = (value) => {
        setTimesPerDay(value);
        const newPickers = Array(parseInt(value)).fill(null);
        setTimePickers(newPickers);
    };  

    const handleSave = async () => {
        // Map frontend variable names to backend field names
        const updatedMed = {
            name: medication.name,  // This already matches the backend
            dosage: medication.dosage,  // This already matches the backend
            instructions: initialData.instructions,  // This already matches the backend
            frequency: parseInt(timesPerDay),  // This already matches the backend
            pillcount: medication.quantity,  // Frontend's quantity -> Backend's pill_count
            times: timePickers.map(t => 
                t?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
              ),
            days: selectedDays,
            ...pillSettings  // Assuming pillSettings are needed
        };
    
        console.log("Creating: ", updatedMed);
        
        try {
            const token = await AsyncStorage.getItem("access_token");
            if (!token) {
                console.error("No token found");
                return;
            }
    
            // Update API call with proper mapping
            await saveMedication(updatedMed);  // Send to API
            console.log("Medication created successfully");
        } catch (error) {
            console.error('Error updating medication:', error);
        }
    };
  

    return (
        <View style={{ flex: 1, backgroundColor: "#F4F4F4" }}>
        <SafeAreaView edges={["top"]} style={{ flex: 0, backgroundColor: "#0288D1" }} />

        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
            <FontAwesome5 name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
        </View>

        <Text style={styles.title}>Medication Schedule</Text>

        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <ScrollView contentContainerStyle={styles.form}>
            
            {/* Day selection */}
            <Text style={styles.text}>What day(s) would you like to take it?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 }}>
                {['Every day', 'Every other day', 'Specific days'].map((label) => (
                <TouchableOpacity
                    key={label}
                    style={[
                    styles.optionButton,
                    daySelection === label && styles.optionButtonSelected
                    ]}
                    onPress={() => setDaySelection(label)}
                >
                    <Text style={daySelection === label ? styles.optionTextSelected : styles.optionText}>
                    {label}
                    </Text>
                </TouchableOpacity>
                ))}
            </View>

            {daySelection === 'Specific days' && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                    <TouchableOpacity
                        key={day}
                        style={[
                            styles.dayButton,
                            selectedDays.includes(day) && styles.dayButtonSelected
                        ]}
                        onPress={() => toggleDay(day)}
                    >
                        <Text style={selectedDays.includes(day) ? styles.dayTextSelected : styles.dayText}>
                            {day}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            )}


            {/* Times per day */}
            <Text style={styles.text}>How many times per day?</Text>
            <View style={styles.pickerWrapper}>
                <Picker
                selectedValue={timesPerDay}
                onValueChange={handleTimesChange}
                style={{ flex: 1 }}
                >
                {["1", "2", "3", "4", "5"].map((num) => (
                    <Picker.Item key={num} label={num} value={num} />
                ))}

                </Picker>
            </View>

            {/* Times per day Picker */}
            <Text style={styles.text}>What time(s)?</Text>
            {timePickers.map((time, index) => (
                <TouchableOpacity
                key={index}
                onPress={() => showDatePicker(index)}
                style={styles.dateInput}
                >
                <Text>{time ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Select time'}</Text>
                <FontAwesome5 name="clock" size={20} color="#757575" />
                </TouchableOpacity>
            ))}

            {/* Time Picker Modal */}
            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="time"
                // Manually set themeVariant to "light" because the picker text became invisible, likely due to a bug
                // This may need to be updated if we implement a dynamic dark/light theme option for the app
                themeVariant='light'
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
            />
            </ScrollView>
        </KeyboardAvoidingView>

        {/* Save Button */}
        <TouchableOpacity 
        style={styles.saveButton} 
        onPress={() => {
            handleSave();
            // Resets Home stack to HomeMain
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'HomeMain' }],
              })
            );
        
            // Then navigates to the Medications tab
            navigation.navigate('Medications');
        }}
        >
            <Text style={styles.scanText}>Save</Text>
        </TouchableOpacity>

        <SafeAreaView edges={["bottom"]} style={{ flex: 0, backgroundColor: "#F4F4F4" }} />
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#0288D1',
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        backgroundColor: '#0288D1',
        paddingLeft: 15,
        paddingTop: 30,
        paddingBottom: 10,
        fontSize: 25,
        color: 'white',
        fontWeight: 'bold',
    },
    form: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 200,
    },
    text: {
        fontWeight: 'bold',
        fontSize: 15,
        marginTop: 15
    },
    optionButton: {
        backgroundColor: '#D9D9D9',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    optionButtonSelected: {
        backgroundColor: '#0288D1',
    },
    optionText: {
        color: '#333',
    },
    optionTextSelected: {
        color: 'white',
        fontWeight: 'bold',
    },
    pickerWrapper: {
        backgroundColor: '#D9D9D9',
        borderRadius: 8,
        marginVertical: 8,
        marginBottom: 15,
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 8,
        padding: 12,
        marginVertical: 8,
        backgroundColor: '#D9D9D9',
    },
    saveButton: {
        backgroundColor: '#29B6F6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 25,
        margin: 20,
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        marginHorizontal: 20,
    },
    scanText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        marginRight: 10,
    },
    dayButton: {
        backgroundColor: '#D9D9D9',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        margin: 5,
    },
    dayButtonSelected: {
        backgroundColor: '#0288D1',
    },
    dayText: {
        color: '#333',
    },
    dayTextSelected: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default MedicationScheduleScreen;