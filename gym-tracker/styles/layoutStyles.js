import { StyleSheet } from 'react-native';

const layoutStyles = StyleSheet.create({
    rowFlex: {
        display: 'flex',
        flexDirection: 'row',
        flexGrow: 1,
    },
    colFlex: {
        display: 'flex',
        flexDirection: 'column',
    },
    spacedEvenly: {
        justifyContent: 'space-evenly',
    },
    spacedBetween: {
        justifyContent: 'space-between'
    },
})

export default layoutStyles;