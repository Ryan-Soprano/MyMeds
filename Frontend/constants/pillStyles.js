import { StyleSheet } from "react-native";

const pillStyles = StyleSheet.create({
    pillContainer: {
        alignSelf: 'center',
        backgroundColor: '#D9D9D9',
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    innerCapsule: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        elevation: 2,
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
    innerShape: { 
        width: 30, 
        height: 30, 
        shadowColor: "#000",
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        elevation: 2, 
    },
    innerCircle: { borderRadius: 15 },
    innerOval: { width: 30, height: 30, borderRadius: 50, transform: [{ scaleX: 1.5 }] },
    innerOblong: { width: 50, height: 25, borderRadius: 15 },
});
  
export default pillStyles;