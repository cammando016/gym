import { Text, View, StyleSheet } from 'react-native';

interface Props {
    exerciseName: string,
    targetMuscle: string,
};

const styles = StyleSheet.create(
    {
        container: {
            borderStyle: 'solid',
            borderColor: 'black',
        },
    }
);

export default function ExerciseSearchResult (props: Props) {
    return (
        <View style={[styles.container]}>
            <View>
                <Text>{props.exerciseName}</Text>
            </View>
            <View>
                <Text>{props.targetMuscle}</Text>
            </View>
        </View>
    )
}