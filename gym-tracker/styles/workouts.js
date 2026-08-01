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
        borderRadius: 10,
        margin: 2,
    },
    exerciseHeader: {
        backgroundColor: '#619888',
        borderTopLeftRadius: 9,
        borderTopRightRadius: 9,
        display: 'flex',
        flex: 1,
        justifyContent: 'space-between',
    },
    exerciseFooter: {
        backgroundColor: '#619888',
        borderBottomLeftRadius: 9,
        borderBottomRightRadius: 9,
        display: 'flex',
        flex: 1,
        justifyContent: 'space-between',
    },
    exerciseSetNotes: {
        backgroundColor: '#619888',
        display: 'flex',
        flex: 1,
        justifyContent: 'space-between',
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