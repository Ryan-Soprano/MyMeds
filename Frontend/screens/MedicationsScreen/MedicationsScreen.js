import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MedicationCard from "../../components/MedicationCard";
import AddMedButton from "../../components/AddMedButton";
import { useState, useEffect } from "react";
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { getMedicationsForMedPage } from "../../api/medicationsApi"; // Import API call
import AsyncStorage from '@react-native-async-storage/async-storage';


const MedicationsScreen = ({navigation}) => {
    const [medications, setMedications] = useState([]);

    useFocusEffect(
        useCallback(() => {
            const fetchMedications = async () => {
                try {
                    const token = await AsyncStorage.getItem("access_token");
                    if (!token) {
                        console.error("No token found");
                        return;
                    }
    
                    const response = await getMedicationsForMedPage();
                    setMedications(response);
                } catch (error) {
                    console.error("Failed to fetch medications:", error);
                }
            };
    
            fetchMedications();
        }, [])
    );
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>MyMeds</Text>

                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {medications.map((med, index) => (
                        <TouchableOpacity 
                            key={index}
                            onPress={() =>
                                navigation.navigate('MedicationViewEdit', {
                                  medication: {
                                    ...med,
                                    startDate: med.startDate instanceof Date ? med.startDate.toISOString() : med.startDate,
                                    endDate: med.endDate instanceof Date ? med.endDate.toISOString() : med.endDate,
                                  },
                                })
                            }
                        >
                            <MedicationCard
                                name={med.name}
                                dosage={med.dosage}
                                taken={med.taken}
                                pillShape={med.pillShape}
                                pillColor={med.pillColor}
                                pillColorLeft={med.pillColorLeft} // NEW
                                pillColorRight={med.pillColorRight} // NEW
                                backgroundColor={med.backgroundColor}
                            />
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <AddMedButton
                onPress={() => navigation.navigate('Home', {
                    screen: 'MedicationDetails',
                })} 
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F4F4F4",
    },
    container: {
        flex: 1,
        backgroundColor: "#F4F4F4",
    },
    title: {
        fontSize: 30,
        color: "#0288D1",
        textAlign: "center",
        paddingVertical: 10,
    },
    scrollContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
});

export default MedicationsScreen;