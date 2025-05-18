import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView,
  Platform, ScrollView
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from '@react-native-picker/picker';
import PillCustomizerModal from '../components/PillCustomizer';
import MedicationCancelPopup from '../components/MedCancelPopup';
import pillStyles from '../constants/pillStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveMedication } from "../api/medicationsApi"; // Import API call



const MedicationViewEditScreen = ({ route, navigation }) => {
  const initialData = route.params?.medication || {};
  const [isCancelPopupVisible, setCancelPopupVisible] = useState(false);


  const [isEditing, setIsEditing] = useState(false);
  const parseDateOnly = (dateValue) => {
    if (!dateValue) return null;
    const dateString = typeof dateValue === 'string' ? dateValue : dateValue.toISOString().split('T')[0];
    const [year, month, day] = dateString.split('-');
    return new Date(year, month - 1, day);
};
  const [medication, setMedication] = useState({
    name: initialData.name || '',
    dosage: initialData.dosage || '',
    quantity: initialData.quantity || '',
    startDate: initialData.startDate ? parseDateOnly(initialData.startDate) : new Date(),
    endDate: initialData.endDate ? parseDateOnly(initialData.endDate) : null,
    instructions: initialData.instructions || '',
  });

  const [pillSettings, setPillSettings] = useState({
    pillShape: initialData.pillShape || "pills",
    pillColor: initialData.pillColor || "#757575",
    pillColorLeft: initialData.pillColorLeft || "#757575",
    pillColorRight: initialData.pillColorRight || "#757575",
    backgroundColor: initialData.backgroundColor || "#D9D9D9",
  });

  const [daySelection, setDaySelection] = useState('Specific days');
  const [selectedDays, setSelectedDays] = useState(initialData.days || []);
  const [timesPerDay, setTimesPerDay] = useState(initialData.timesPerDay || initialData.times?.length?.toString() || "1");
  const [timePickers, setTimePickers] = useState(
    initialData.times?.map(timeStr => new Date(`1970-01-01T${timeStr}:00`)) || [null]
  );

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [currentPickerIndex, setCurrentPickerIndex] = useState(null);
  const [pillCustomizerVisible, setPillCustomizerVisible] = useState(false);

  const toggleDay = (day) => {
    if (!isEditing) return;
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleDateConfirm = (date) => {
    setDate(date);
    hideDatePicker();
  };

  // Function to handle the time confirmation
  const handleTimeConfirm = (time) => {
    setTimePickers(time);
    hideTimePicker();
  };

  // Function to hide the date picker
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  // Function to hide the time picker
  const hideTimePicker = () => {
    setTimePickerVisibility(false);
  };


  // Function to show the time picker
  const showTimePicker = (index) => {
    if (!isEditing) return;
    setCurrentPickerIndex(index);
    setTimePickerVisibility(true);
  };

  const showDatePicker = (index) => {
    if (!isEditing) return;
    setCurrentPickerIndex(index);
    setDatePickerVisibility(true);
  };

  const handleConfirm = (date) => {
    const updatedPickers = [...timePickers];
    updatedPickers[currentPickerIndex] = date;
    setTimePickers(updatedPickers);
    hideTimePicker();
};

  const handleTimesChange = (value) => {
    if (!isEditing) return;
    setTimesPerDay(value);
    setTimePickers(Array(parseInt(value)).fill(null));
  };

  const handleSave = async () => {
    // Map frontend variable names to backend field names
    const updatedMed = {
        name: medication.name,  // This already matches the backend
        dosage: medication.dosage,  // This already matches the backend
        instructions: medication.instructions,  // This already matches the backend
        frequency: parseInt(timesPerDay),  // This already matches the backend
        pillcount: medication.quantity,  // Frontend's quantity -> Backend's pill_count
        times: timePickers.map(t => 
          t?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        ),
        days: selectedDays,
        ...pillSettings  // Assuming pillSettings are needed
    };

    console.log("Saving Medication:", updatedMed);

    setIsEditing(false);

    try {
        const token = await AsyncStorage.getItem("access_token");
        if (!token) {
            console.error("No token found");
            return;
        }

        // Update API call with proper mapping
        await saveMedication(updatedMed);  // Send to API
        console.log("Medication updated successfully");
    } catch (error) {
        console.error('Error updating medication:', error);
    }
};


  return (
    <View style={{ flex: 1, backgroundColor: "#F4F4F4" }}>
      <SafeAreaView edges={["top"]} style={{ flex: 0, backgroundColor: "#0288D1" }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (isEditing) {
            setCancelPopupVisible(true);
          } else {
            navigation.goBack();
          }
        }}>
          <FontAwesome5 name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Text style={styles.nextText}>{isEditing ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      {/* <Text style={styles.title}>Medication Info</Text> */}

      <TouchableOpacity
        style={[pillStyles.pillContainer, { backgroundColor: pillSettings.backgroundColor, marginVertical: 15 }]}
        disabled={!isEditing}
        onPress={() => setPillCustomizerVisible(true)}
      >
        {pillSettings.pillShape === "capsule" ? (
          <View style={pillStyles.innerCapsule}>
            <View style={[pillStyles.innerCapsuleLeftHalf, { backgroundColor: pillSettings.pillColorLeft }]} />
            <View style={[pillStyles.innerCapsuleRightHalf, { backgroundColor: pillSettings.pillColorRight }]} />
          </View>
        ) : pillSettings.pillShape === "pills" ? (
          <FontAwesome5 name="pills" size={30} color={pillSettings.pillColor} />
        ) : (
          <View
            style={[
              pillStyles.innerShape,
              pillSettings.pillShape === "circle" && pillStyles.innerCircle,
              pillSettings.pillShape === "oval" && pillStyles.innerOval,
              pillSettings.pillShape === "oblong" && pillStyles.innerOblong,
              { backgroundColor: pillSettings.pillColor },
            ]}
          />
        )}
      </TouchableOpacity>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.form}>
          <Text style={styles.text}>Name</Text>
          <TextInput
            style={styles.input}
            editable={isEditing}
            value={medication.name}
            onChangeText={(text) => setMedication({ ...medication, name: text })}
          />

          <Text style={styles.text}>Dosage</Text>
          <TextInput
            style={styles.input}
            editable={isEditing}
            value={medication.dosage}
            onChangeText={(text) => setMedication({ ...medication, dosage: text })}
          />

        <Text style={styles.text}>Quantity</Text>
        <TextInput
          style={styles.input}
          editable={isEditing}
          keyboardType="numeric"
          value={medication.quantity?.toString() || ''} // Ensure it's a string
          onChangeText={(text) =>
            setMedication({ ...medication, quantity: parseInt(text) || 0 }) // Convert back to number
          }
        />
          
          <Text style={styles.text}>Start Date</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => isEditing && setDatePickerVisibility(true)}
          >
            <Text>{medication.startDate.toDateString()}</Text>
            <FontAwesome5 name="calendar-alt" size={20} color="#757575" />
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            themeVariant='light'
            onConfirm={(date) => {
              setMedication({ ...medication, startDate: date });
              hideDatePicker();
            }}
            onCancel={hideDatePicker}
          />

          <DateTimePickerModal
              isVisible={isTimePickerVisible}
              mode="time"
              // Manually set themeVariant to "light" because the picker text became invisible, likely due to a bug
              // This may need to be updated if we implement a dynamic dark/light theme option for the app
              themeVariant='light'
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
          />

          <Text style={styles.text}>Days</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => (
              <TouchableOpacity
                key={day}
                style={[styles.dayButton, selectedDays.includes(day) && styles.dayButtonSelected]}
                onPress={() => toggleDay(day)}
              >
                <Text style={selectedDays.includes(day) ? styles.dayTextSelected : styles.dayText}>{day}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.text}>Times per Day</Text>
          {isEditing ? (
            <View style={styles.pickerWrapper}>
              <Picker selectedValue={timesPerDay} onValueChange={handleTimesChange}>
                {["1", "2", "3", "4", "5"].map((num) => (
                  <Picker.Item key={num} label={num} value={num} />
                ))}
              </Picker>
            </View>
          ) : (
            <View style={styles.input}>
              <Text>{timesPerDay}</Text>
            </View>
            
          )}

          <Text style={styles.text}>Times</Text>
          {timePickers.map((time, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => showTimePicker(index)}
              style={styles.dateInput}
              disabled={!isEditing}
            >
              <Text>{time ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Select time'}</Text>
              <FontAwesome5 name="clock" size={20} color="#757575" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>

      {isEditing && (
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.scanText}>Save</Text>
        </TouchableOpacity>
      )}

      <PillCustomizerModal
        visible={pillCustomizerVisible}
        onClose={() => setPillCustomizerVisible(false)}
        onConfirm={(settings) => setPillSettings(settings)}
        initialSettings={pillSettings}
      />

      <MedicationCancelPopup
        visible={isCancelPopupVisible}
        onContinue={() => setCancelPopupVisible(false)}
        onQuit={() => {
          setCancelPopupVisible(false);
          navigation.goBack();
        }}
        title="Your changes weren't saved!"
        subtitle="Are you sure you want to quit?"
        continueText="Continue Editing Medication"
        quitText="Quit"
      />

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
      justifyContent: 'space-between',
    },
    form: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 100,
    },
    text: {
      fontWeight: 'bold',
      fontSize: 15, 
      marginTop: 10,
    },
    input: {
      borderRadius: 8,
      padding: 12,
      marginVertical: 8,
      backgroundColor: '#D9D9D9'
    },
    nextText: {
      color: 'white',
      fontSize: 16,
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
    dateInput: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 8,
      padding: 12,
      marginVertical: 8,
      backgroundColor: '#D9D9D9',
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
    pickerWrapper: {
      backgroundColor: '#D9D9D9',
      borderRadius: 8,
      marginVertical: 8,
      marginBottom: 15,
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
});

export default MedicationViewEditScreen;