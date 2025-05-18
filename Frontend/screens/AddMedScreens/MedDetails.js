import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert, Image } from 'react-native';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import MedicationCancelPopup from '../../components/MedCancelPopup';
import { CommonActions } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import PillCustomizerModal from '../../components/PillCustomizer';
import pillStyles from '../../constants/pillStyles';
import { uploadImage } from '../../api/medicationsApi';

const MedicationDetailsScreen = ({navigation}) => {
    const [medication, setMedication] = useState({
      name: '',
      dosage: '',
      quantity: '',
      startDate: new Date(),
      endDate: null,
      instructions: '',
      frequency: '1',
    });
    const [isStartPickerVisible, setStartPickerVisible] = useState(false);
    // const [isEndPickerVisible, setEndPickerVisible] = useState(false); For End Date Picker
    const [isCancelPopupVisible, setCancelPopupVisible] = useState(false);
    const [medicationImage, setMedicationImage] = useState(null);
    const [pillCustomizerVisible, setPillCustomizerVisible] = useState(false);
    const [pillSettings, setPillSettings] = useState({
        pillShape: "pills",
        pillColor: "#757575",
        pillColorLeft: "#757575",
        pillColorRight: "#757575",
        backgroundColor: "#D9D9D9",
    });
    

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Camera permission is required to take photos');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7,
        });

        const tempstorage = uploadImage(result.assets[0].uri);

    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Media library permission is required to select photos');
            return;
        }
    
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });
    
        if (!result.canceled && result.assets && result.assets.length > 0) {
            const imageUri = result.assets[0].uri;
    
            try {
                const response = await uploadImage(imageUri);
                console.log('Image uploaded successfully:', response);
                const [medicineName, dosage, instructions, pillCount, frequency] = response[0];
                setMedication({ ...medication, name: medicineName, dosage, instructions, quantity: pillCount, frequency });
                // You can also update state or show feedback to the user here
            } catch (error) {
                console.error('Error uploading image:', error);
                Alert.alert('Upload failed', 'There was an error uploading the image.');
            }
        }
    };

    const handleSelectImage = () => {
        Alert.alert(
            'Medication Image',
            'Choose an option',
            [
                { text: 'Take Photo', onPress: takePhoto },
                { text: 'Choose from Gallery', onPress: pickImage },
                { text: 'Cancel', style: 'cancel' },
            ],
            { cancelable: true }
        );
    };
    
    return (
        <View style={{ flex: 1, backgroundColor: "#F4F4F4" }}>
        <SafeAreaView edges={["top"]} style={{ flex: 0, backgroundColor: "#0288D1" }} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => setCancelPopupVisible(true)}>
                    <FontAwesome5 name="times" size={24} color="white" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('MedicationSchedule', {
                                  medication: {
                                    ...medication, ...pillSettings,
                                    startDate: medication.startDate instanceof Date ? medication.startDate.toISOString() : medication.startDate,
                                    endDate: medication.endDate instanceof Date ? medication.endDate.toISOString() : medication.endDate,}
                                })}>
                    <Text style={styles.nextText}>Next</Text>
                </TouchableOpacity>
            </View>
         
            <Text style={styles.title}>Medication Details</Text>

            {/* Pill Shape Preview */}
            <TouchableOpacity
                style={[pillStyles.pillContainer, { backgroundColor: pillSettings.backgroundColor, marginVertical: 15 }]}
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

            <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            >
            <ScrollView contentContainerStyle={styles.form}>
                {/* Input Fields */}
                <Text style={styles.text}>Name</Text>
                <TextInput
                style={styles.input}
                placeholder="Enter medication name"
                value={medication.name}
                onChangeText={(text) => setMedication({ ...medication, name: text })}
                />

                <Text style={styles.text}>Dosage</Text>
                <TextInput
                style={styles.input}
                placeholder="Enter dosage"
                value={medication.dosage}
                onChangeText={(text) => setMedication({ ...medication, dosage: text })}
                />

                {/* If we decide on 'Quantity' */}
                <Text style={styles.text}>Quantity</Text>
                <TextInput
                style={styles.input}
                placeholder="Enter quantity"
                value={medication.quantity}
                onChangeText={(text) => setMedication({ ...medication, quantity: text })}
                />

                <Text style={styles.text}>Instructions</Text>
                <TextInput
                style={styles.input}
                placeholder="Enter instructions"
                value={medication.instructions}
                onChangeText={(text) => setMedication({ ...medication, instructions: text })}
                />

                {/* Start Date Picker */}
                <Text style={styles.text}>Start Date</Text>
                <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setStartPickerVisible(true)}
                >
                    <Text>{medication.startDate.toDateString()}</Text>
                    <FontAwesome5 name="calendar-alt" size={20} color="#757575" />
                </TouchableOpacity>

                <DateTimePickerModal
                    isVisible={isStartPickerVisible}
                    mode="date"
                    // Manually set themeVariant to "light" because the picker text became invisible, likely due to a bug
                    // This may need to be updated if we implement a dynamic dark/light theme option for the app
                    themeVariant='light'
                    onConfirm={(date) => {
                        setMedication({ ...medication, startDate: date });
                        setStartPickerVisible(false);
                    }}
                    onCancel={() => setStartPickerVisible(false)}
                />

                {/* End Date Picker */}
                {/* <Text style={styles.text}>End Date</Text>
                <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setEndPickerVisible(true)}
                >
                    <Text>{medication.endDate ? medication.endDate.toDateString() : "Select date"}</Text>
                    <FontAwesome5 name="calendar-alt" size={20} color="#757575" />
                </TouchableOpacity>

                <DateTimePickerModal
                    isVisible={isEndPickerVisible}
                    mode="date"
                    onConfirm={(date) => {
                        setMedication({ ...medication, endDate: date });
                        setEndPickerVisible(false);
                }}
                    onCancel={() => setEndPickerVisible(false)}
                /> */}
            </ScrollView>
            </KeyboardAvoidingView>

        {/* Scan Button */}
        <TouchableOpacity style={styles.scanButton} onPress={handleSelectImage}>
            <Text style={styles.scanText}>Scan Your Medication</Text>
            <MaterialCommunityIcons name="camera" size={20} color="white" />
        </TouchableOpacity>

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
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [
                      { name: 'Home' },
                    ],
                  })
                );
            }}
        />
        <SafeAreaView edges={["bottom"]} style={{ flex: 0, backgroundColor: "#F4F4F4" }} />
        </View>
        
    );
};
  
const styles = StyleSheet.create({
safeArea: {
    flex: 1,
    backgroundColor: "#F4F4F4",
},
container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
},
header: {
    backgroundColor: '#0288D1',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
nextText: {
    color: 'white',
    fontSize: 16,
},
form: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 100,
},
text: {
    fontWeight: 'bold',
    fontSize: 15, 
},
input: {
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    marginBottom: 15,
    backgroundColor: '#D9D9D9'
},
dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    marginBottom: 15,
    backgroundColor: '#D9D9D9'
},
scanButton: {
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

export default MedicationDetailsScreen;