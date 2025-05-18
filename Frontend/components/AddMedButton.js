import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";

const AddMedButton = ({ onPress }) => {
    return (
        <TouchableOpacity style={styles.fab} onPress={onPress}>
            <AntDesign name="plus" size={28} color="white" />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    fab: {
        position: "absolute",
        bottom: 20,
        right: 20,
        backgroundColor: "#29B6F6",
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
});

export default AddMedButton;
