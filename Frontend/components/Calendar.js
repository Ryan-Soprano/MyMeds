import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, PanResponder } from "react-native";
import dayjs from "dayjs";

const CalendarWeek = ({ onDateSelect }) => {
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekDates, setWeekDates] = useState([]);
  const [selectedWeekday, setSelectedWeekday] = useState(dayjs().day());

  useEffect(() => {
    generateWeek(weekOffset);
  }, [weekOffset]);

  const generateWeek = (offset) => {
    const startOfWeek = dayjs().startOf("week").add(offset * 7, "days");
    let week = [];
    for (let i = 0; i < 7; i++) {
      const date = startOfWeek.clone().add(i, "days");
      week.push({
        day: date.format("ddd"), 
        date: date.format("DD"), 
        fullDate: date.format("YYYY-MM-DD"),
      });
    }

    setWeekDates(week);

    // Find and set the new selected date based on the saved weekday index
    const newSelectedDate = week[selectedWeekday]?.fullDate;
    if (newSelectedDate) {
      setSelectedDate(newSelectedDate);
      onDateSelect(newSelectedDate);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedWeekday(dayjs(date).day());
    onDateSelect(date);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dx < -50) {
        // Swipe left: Next week
        setWeekOffset((prev) => prev + 1);
      } else if (gestureState.dx > 50) {
        // Swipe right: Previous week
        setWeekOffset((prev) => prev - 1);
      }
    },
  });

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <FlatList
        data={weekDates}
        horizontal
        keyExtractor={(item) => item.fullDate}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.dateContainer,
              selectedDate === item.fullDate && styles.selectedDateContainer,
            ]}
            onPress={() => handleDateSelect(item.fullDate)}
          >
            <Text style={styles.dayText}>{item.day}</Text>
            <View
              style={[
                styles.circle,
                selectedDate === item.fullDate && styles.selectedCircle,
              ]}
            >
              <Text
                style={[
                  styles.dateText,
                  selectedDate === item.fullDate && styles.selectedDateText,
                ]}
              >
                {item.date}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    backgroundColor: "#F4F4F4",
    alignItems: "center",
  },
  dateContainer: {
    alignItems: "center",
    marginHorizontal: 8,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D9D9D9",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  selectedDateContainer: {
    alignItems: "center",
  },
  selectedCircle: {
    backgroundColor: "#29B6F6",
  },
  selectedDateText: {
    color: "#fff",
  },
});

export default CalendarWeek;
