import { StyleSheet } from 'react-native';

const workoutStyles = StyleSheet.create({
    setModifier: {
        width: 32,
        height: 32
    },
    trueSetModifier: {
        borderWidth: 2,
        borderColor: 'green'
    },
    exerciseContainer: {
        borderWidth: 1,
        borderColor: '#619888',
        borderRadius: '2%',
        margin: 2,
    },
    exerciseHeader: {
        backgroundColor: '#619888',
        borderRadius: '2%',
    },
    headerText: {
        color: 'white'
    },
    headerTextBold: {
        fontWeight: 'bold'
    },
    errorText: {
        color: 'red',
    },
})

export default workoutStyles