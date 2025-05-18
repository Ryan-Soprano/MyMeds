import { SafeAreaView, ScrollView, Text, View, StyleSheet, TouchableOpacity } from "react-native";
import MedicationCard from "../../components/MedicationCard";
import React, { useState, useEffect, useCallback } from 'react';
import CalendarWeek from "../../components/Calendar";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import styles from "./Style";
import AddMedButton from "../../components/AddMedButton";
import MedicationPopup from "../../components/MedicationPopup";
import { useDependent } from '../../context/DependentContext';
import { getMedications } from "../../api/medicationsApi";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

dayjs.extend(customParseFormat);

const getDependentMockData = (dependentName) => {
  switch (dependentName) {
    case "Grandma":
      return [
        {
          name: "Tylenol",
          dosage: "160mg",
          quantity: "30",
          times: ["08:00", "20:00"],
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          pillShape: "circle",
          pillColor: "#FB8C00",
          backgroundColor: "#FFE0B2",
          taken: true
        }
      ];
    default:
      return [
        {
          name: "General Medication",
          dosage: "100mg",
          quantity: "60",
          times: ["12:00"],
          days: ["Monday", "Wednesday", "Friday"],
          pillShape: "pills",
          pillColor: "#757575",
          backgroundColor: "#D9D9D9",
          taken: true
        }
      ];
  }
};

const groupMedicationsByTime = (medications) => {
  const grouped = {};

  medications.forEach((med) => {
    med.times.forEach((time) => {
      const formattedTime = dayjs(time, "HH:mm").format("h:mm A");

      if (!grouped[formattedTime]) {
        grouped[formattedTime] = [];
      }
      grouped[formattedTime].push({ ...med });
    });
  });

  return Object.entries(grouped)
    .map(([time, meds]) => ({ time, medications: meds }))
    .sort((a, b) => dayjs(a.time, "h:mm A").valueOf() - dayjs(b.time, "h:mm A").valueOf());
};

const HomeScreen = ({ navigation }) => {
  const [medications, setMedications] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [takenMedications, setTakenMedications] = useState({});

  const { isManaging, currentUser, stopManaging } = useDependent();

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          if (isManaging && currentUser) {
            const dependentMeds = getDependentMockData(currentUser.name);
            setMedications(dependentMeds);
            setTakenMedications(true);
          } else {
            const token = await AsyncStorage.getItem("access_token");
            if (!token) {
              console.error("No token found");
              return;
            }
            const response = await getMedications();
            setMedications(response);
          }
        } catch (error) {
          console.error("Failed to fetch medications:", error);
        }
      };

      fetchData();
    }, [isManaging, currentUser])
  );

  const getMedicationsForDay = (date) => {
    const dayName = date.format("dddd");
    return medications.filter((med) => med.days.includes(dayName));
  };

  const dailyMedications = getMedicationsForDay(selectedDate);
  const medicationsByTime = groupMedicationsByTime(dailyMedications);

  const handleTake = (medicationName, medicationTime) => {
    const key = `${medicationName}-${medicationTime}-${selectedDate.format("YYYY-MM-DD")}`;

    setTakenMedications((prevState) => ({
      ...prevState,
      [key]: true,
    }));
    setModalVisible(false);
  };

  React.useLayoutEffect(() => {
    if (isManaging) {
      navigation.setOptions({
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => {
              stopManaging();
              navigation.navigate('Profile');
            }}
            style={{ marginLeft: 15 }}
          >
            <Text style={{ color: '#0288D1', fontSize: 16 }}>Back to My Account</Text>
          </TouchableOpacity>
        )
      });
    } else {
      navigation.setOptions({
        headerLeft: undefined
      });
    }
  }, [isManaging, navigation, stopManaging]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>MyMeds</Text>

        <CalendarWeek onDateSelect={(date) => setSelectedDate(dayjs(date))} />

        <Text style={styles.dateText}>
          {selectedDate.isSame(dayjs(), "day") ? "Today" : selectedDate.format("dddd")},{" "}
          {selectedDate.format("MMMM D")}
        </Text>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {medicationsByTime.length > 0 ? (
            medicationsByTime.map((group, index) => (
              <View key={index} style={styles.timeSection}>
                <Text style={styles.timeText}>{group.time}</Text>
                {group.medications.map((med, idx) => {
                  const key = `${med.name}-${group.time}-${selectedDate.format("YYYY-MM-DD")}`;
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => {
                        setSelectedMedication({ name: med.name, time: group.time });
                        setModalVisible(true);
                      }}
                    >
                      <MedicationCard
                        name={med.name}
                        dosage={med.dosage}
                        taken={takenMedications[key] || false}
                        pillShape={med.pillShape}
                        pillColor={med.pillColor}
                        pillColorLeft={med.pillColorLeft}
                        pillColorRight={med.pillColorRight}
                        backgroundColor={med.backgroundColor}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))
          ) : (
            <Text style={styles.noMedsText}>No medications scheduled for this day.</Text>
          )}
        </ScrollView>

        <AddMedButton onPress={() => navigation.navigate('MedicationDetails')} />

        <MedicationPopup
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          medication={selectedMedication || { name: "", time: "" }}
          onTake={handleTake}
        />
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
