import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MedicationCancelPopup = ({
    visible,
    onContinue,
    onQuit,
    title = "Your medication wasn't saved!",
    subtitle = "Are you sure you want to quit?",
    continueText = "Continue Adding Medication",
    quitText = "Quit"
  }) => {
    if (!visible) return null;
  
    return (
      <Modal transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <Ionicons name="alert-circle-outline" size={30} color="white" style={styles.icon} />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
  
            <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
              <Text style={styles.continueText}>{continueText}</Text>
            </TouchableOpacity>
  
            <TouchableOpacity onPress={onQuit}>
              <Text style={styles.quitText}>{quitText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };  

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
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
    icon: {
        marginBottom: 12,
    },
    title: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        color: 'white',
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    continueButton: {
        backgroundColor: '#5CD164',
        borderRadius: 24,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    continueText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
    quitText: {
        color: 'white',
        textDecorationLine: 'underline',
        fontSize: 16,
    },
});

export default MedicationCancelPopup;