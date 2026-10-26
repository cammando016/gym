import { StyleSheet } from "react-native";

const formStyles = StyleSheet.create({
    setModifierOff: {
        borderColor: 'red',
        borderWidth: 1
    },
    setModifierOn: {
        borderColor: 'green',
        borderWidth: 1
    },
    inputLabelPair: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginRight: 10,
    },
    input: {
        paddingHorizontal: 10,
        paddingVertical: 1,
        borderColor: 'grey',
        borderWidth: 2,
        borderRadius: 4,
    },
    inputLarge: {
        flexGrow: 1,
        marginRight: 10,
    },
    formRow: {
        marginVertical: 5,
    },
    boldText: {
        fontWeight: 'bold',
        marginVertical: 5,
    },
    setInteractionsContainer: {
        marginHorizontal: 5,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
    },
    setInteractionButton: {
        width: 32,
        height: 32,
        borderColor: '#619888',
        borderWidth: 2,
        borderRadius: 4,
        backgroundColor: '#61988880',
        justifyContent: 'center',
    }
});

export default formStyles;