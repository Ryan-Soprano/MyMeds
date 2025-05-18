import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

const MedicationCard = ({ 
  name = "Medication",
  dosage = "dosage (mg)",
  pillShape = "pills",
  pillColor = "#757575",
  pillColorLeft,
  pillColorRight,
  backgroundColor = "#D9D9D9",
  taken
}) => {
  const leftColor = pillColorLeft || pillColor;
  const rightColor = pillColorRight || pillColor;

  return (
    <View style={styles.card}>
      {/* Pill Icon with Dynamic Background */}
      {/* <View style={[styles.iconContainer, { backgroundColor }]}>
        <FontAwesome5 name={pillShape} size={24} color={pillColor} />
      </View> */}

      <View style={[styles.iconContainer, { backgroundColor }]}>
        {pillShape === "capsule" ? (
          <View style={styles.innerCapsule}>
            <View style={[styles.innerCapsuleLeftHalf, { backgroundColor: leftColor }]} />
            <View style={[styles.innerCapsuleRightHalf, { backgroundColor: rightColor }]} />
          </View>
        ) : pillShape === "pills" ? (
          <FontAwesome5 name="pills" size={30} color={pillColor} />
        ) : (
          <View
            style={[
              styles.innerShape,
              pillShape === "circle" && styles.innerCircle,
              pillShape === "oval" && styles.innerOval,
              pillShape === "oblong" && styles.innerOblong,
              { backgroundColor: pillColor }
            ]}
          />
        )}
      </View>


      {/* Medication Details */}
      <View style={styles.textContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.dosage}>{dosage}</Text>
      </View>

      {/* Checkmark if Taken */}
      {taken && (
        <FontAwesome5 name="check-circle" size={24} color="green" style={styles.checkmark} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  dosage: {
    fontSize: 14,
    color: "#777",
  },
  checkmark: {
    marginLeft: 8,
  },
  innerCapsule: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCapsuleLeftHalf: {
    width: 25, 
    height: 23,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
  },
  innerCapsuleRightHalf: {
    width: 25,
    height: 20,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },  
  innerShape: { width: 30, height: 30 },
  innerCircle: { borderRadius: 15 },
  innerOval: { width: 30, height: 30, borderRadius: 50, transform: [{ scaleX: 1.5 }] },
  innerOblong: { width: 50, height: 25, borderRadius: 15 },
});

export default MedicationCard;