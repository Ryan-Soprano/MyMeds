import { StyleSheet } from "react-native";

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
    dateText: {
        fontSize: 25,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
        marginVertical: 10,
    },
    scrollContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    timeSection: {
        marginVertical: 10,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    timeText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#0288D1",
        marginBottom: 5,
    },
    noMedsText: {
        fontSize: 18,
        textAlign: "center",
        color: "#666",
        marginTop: 20,
    },
});
  
export default styles;