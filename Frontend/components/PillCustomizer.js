import { FontAwesome5 } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from "react-native";
import pillStyles from "../constants/pillStyles";

const pillShapes = ["capsule", "circle", "oval", "oblong"];

const colorPalette = [
  "#FAF9F6", "#E53935", "#FB8C00", "#FDD835", "#1E88E5", 
  "#43A047", "#8E24AA", "#00ACC1", "#90A4AE", "#F06292"
];

const backgroundPalette = [
  "#BDBDBD", "#FFCDD2", "#FFE0B2", "#FFF176", "#90CAF9",
  "#A5D6A7", "#CE93D8", "#80DEEA", "#B0BEC5", "#F8BBD0" 
];

const PillCustomizerModal = ({
  visible,
  onClose,
  onConfirm,
  initialSettings = {}
}) => {
  const {
    pillShape: initialShape = "pills",
    pillColor: initialPillColor = "#757575",
    pillColorLeft: initialPillColorLeft = "#757575",
    pillColorRight: initialPillColorRight = "#757575",
    backgroundColor: initialBackgroundColor = "#D9D9D9",
  } = initialSettings;

  const [pillShape, setPillShape] = useState(initialShape);
  const [pillColorLeft, setPillColorLeft] = useState(initialPillColorLeft || initialPillColor);
  const [pillColorRight, setPillColorRight] = useState(initialPillColorRight || initialPillColor);
  const [backgroundColor, setBackgroundColor] = useState(initialBackgroundColor);
  const [prevSettings, setPrevSettings] = useState(null);

  useEffect(() => {
    if (visible) {
      setPrevSettings({
        pillShape: initialShape,
        pillColorLeft: initialPillColorLeft || initialPillColor,
        pillColorRight: initialPillColorRight || initialPillColor,
        backgroundColor: initialBackgroundColor,
      });
  
      setPillShape(initialShape);
      setPillColorLeft(initialPillColorLeft || initialPillColor);
      setPillColorRight(initialPillColorRight || initialPillColor);
      setBackgroundColor(initialBackgroundColor);
    }
  }, [visible]);  

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Customize Icon</Text>
          <View style={[pillStyles.pillContainer, { backgroundColor }]}>
            {pillShape === "capsule" ? (
              <View style={pillStyles.innerCapsule}>
                <View style={[pillStyles.innerCapsuleLeftHalf, { backgroundColor: pillColorLeft }]} />
                <View style={[pillStyles.innerCapsuleRightHalf, { backgroundColor: pillColorRight }]} />
              </View>
            ) : pillShape === "pills" ? (
              <FontAwesome5 name="pills" size={30} color={pillColorLeft} />
            ) : (
              <View
                style={[
                  pillStyles.innerShape,
                  pillShape === "circle" && pillStyles.innerCircle,
                  pillShape === "oval" && pillStyles.innerOval,
                  pillShape === "oblong" && pillStyles.innerOblong,
                  { backgroundColor: pillColorLeft },
                ]}
              />
            )}
          </View>

          <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.sectionTitle}>Shape</Text>
          <View style={styles.row}>
            {pillShapes.map((shape) => (
            <TouchableOpacity
              key={shape}
              style={[styles.shapeOption, pillShape === shape && styles.selectedOption]}
              onPress={() => setPillShape(shape)}
            >
              {shape === "capsule" ? (
                <View style={pillStyles.innerCapsule}>
                  <View
                    style={[ 
                      pillStyles.innerCapsuleLeftHalf, 
                      {backgroundColor: pillShape === shape ? pillColorLeft : "#757575"},
                    ]}
                  />
                  <View
                    style={[
                      pillStyles.innerCapsuleRightHalf,
                      {backgroundColor: pillShape === shape ? pillColorRight : "#757575"},
                    ]}
                  />
                </View>
              ) : shape === "pills" ? (
                <FontAwesome5
                  name="pills"
                  size={24}
                  color={pillShape === shape ? pillColorLeft : "#757575"}
                />
              ) : (
                <View
                  style={[
                    pillStyles.innerShape,
                    shape === "circle" && pillStyles.innerCircle,
                    shape === "oval" && pillStyles.innerOval,
                    shape === "oblong" && pillStyles.innerOblong,
                    {backgroundColor: pillShape === shape ? pillColorLeft : "#757575"},
                  ]}
                />
              )}
            </TouchableOpacity>
          ))}
          </View>

          {pillShape === "capsule" ? (
            <>
              <Text style={styles.sectionTitle}>Left Side</Text>
              <View style={styles.colorRow}>
                {colorPalette.map((color) => (
                  <TouchableOpacity
                    key={color + "L"}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color },
                      pillColorLeft === color && styles.selectedColor,
                    ]}
                    onPress={() => setPillColorLeft(color)}
                  />
                ))}
              </View>
              <Text style={styles.sectionTitle}>Right Side</Text>
              <View style={styles.colorRow}>
                {colorPalette.map((color) => (
                  <TouchableOpacity
                    key={color + "R"}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color },
                      pillColorRight === color && styles.selectedColor,
                    ]}
                    onPress={() => setPillColorRight(color)}
                  />
                ))}
              </View>
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Color</Text>
              <View style={styles.colorRow}>
                {colorPalette.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color },
                      pillColorLeft === color && styles.selectedColor,
                    ]}
                    onPress={() => setPillColorLeft(color)}
                  />
                ))}
              </View>
            </>
          )}

        
          <Text style={styles.sectionTitle}>Background</Text>
          <View style={styles.colorRow}>
            {backgroundPalette.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: color },
                  backgroundColor === color && styles.selectedColor,
                ]}
                onPress={() => setBackgroundColor(color)}
              />
            ))}
          </View>
          </ScrollView>

        <View style={styles.buttons}>
          <TouchableOpacity
              onPress={() => {
                onConfirm({
                  pillShape,
                  pillColor: pillColorLeft,
                  pillColorLeft,
                  pillColorRight,
                  backgroundColor,
                });
                onClose();
              }}
              style={styles.confirmButton}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (prevSettings) {
                  setPillShape(prevSettings.pillShape);
                  setPillColorLeft(prevSettings.pillColorLeft);
                  setPillColorRight(prevSettings.pillColorRight);
                  setBackgroundColor(prevSettings.backgroundColor);
                }
                onClose();
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
      
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "#00000099", justifyContent: "center", padding: 20 },
  modalContainer: { backgroundColor: "#fff", borderRadius: 15, padding: 20, maxHeight: Dimensions.get("window").height * 0.75, width: "100%" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  scrollContainer: { paddingBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginTop: 10, marginBottom: 6 },
  row: { flexDirection: "row", justifyContent: "space-around", flexWrap: "wrap", marginBottom: 10 },
  shapeOption: { alignItems: "center", margin: 6 },
  selectedOption: { borderBottomWidth: 2, borderBottomColor: "#0288D1" },
  colorRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginBottom: 10 },
  colorSwatch: { width: 35, height: 35, borderRadius: 50, margin: 10, borderWidth: 1, borderColor: "#ccc" },
  selectedColor: { borderWidth: 2, borderColor: "#0288D1" },
  buttons: { marginTop: 10 },
  cancelText: { color: 'black', fontSize: 16, paddingTop: 10, textAlign: 'center' },
  confirmButton: { padding: 10, backgroundColor: "#29B6F6", borderRadius: 24, minWidth: 100, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});

export default PillCustomizerModal;