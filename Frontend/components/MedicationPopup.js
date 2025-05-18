import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";

const MedicationPopup = ({ visible, onClose, medication, onTake }) => {
    if (!visible) return null;

    return (
        <Modal transparent animationType="fade">
            <TouchableOpacity style={styles.overlay} onPress={onClose}>
                <View style={styles.popup}>
                    <Text style={styles.medicationName}>{medication.name}</Text>
                    <Text style={styles.time}>{medication.time}</Text>

                    <View style={styles.buttonContainer}>
                        {/* Skip Button – Still needs functionality based on database structure*/}
                        <TouchableOpacity style={styles.button}>
                            <View style={[styles.iconBackground, { backgroundColor: "red" }]}>
                                <FontAwesome name="times" size={30} color="white" />
                            </View>
                            <Text style={styles.buttonText}>SKIP</Text>
                        </TouchableOpacity>

                        {/* Take Button */}
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => onTake(medication.name, medication.time)} // Pass both name and time to onTake
                        >
                            <View style={[styles.iconBackground, { backgroundColor: "green" }]}>
                                <FontAwesome name="check" size={30} color="white" />
                            </View>
                            <Text style={styles.buttonText}>TAKE</Text>
                        </TouchableOpacity>

                         {/* Snooze Button (if time permits) – Still needs functionality based on database structure */}
                        <TouchableOpacity style={styles.button}>
                            <View style={[styles.iconBackground, { backgroundColor: "gold" }]}>
                                <MaterialCommunityIcons name="bell-sleep" size={30} color="white" />
                            </View>
                            <Text style={styles.buttonText}>SNOOZE</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};


const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    popup: {
        width: "80%",
        backgroundColor: "#4A90E2",
        borderRadius: 15,
        padding: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    medicationName: {
        fontSize: 22,
        fontWeight: "bold",
        color: "white",
        marginBottom: 5,
    },
    time: {
        fontSize: 18,
        color: "white",
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    button: {
        alignItems: "center",
        marginHorizontal: 10,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "white",
        marginTop: 5,
    },
    iconBackground: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default MedicationPopup;