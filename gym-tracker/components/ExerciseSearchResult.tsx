import { Text, View, Pressable, StyleSheet } from 'react-native';

interface Props {
    exerciseName: string,
    targetMuscle: string,
    onPress: () => void,
};

const styles = StyleSheet.create(
    {
        container: {
            borderStyle: 'solid',
            borderColor: 'black',
            borderWidth: 1,
        },
    }
);

export default function ExerciseSearchResult (props: Props) {
    return (
        <Pressable onPress={props.onPress} style={[styles.container]}>
            <View>
                <Text>{props.exerciseName}</Text>
            </View>
            <View>
                <Text>{props.targetMuscle}</Text>
            </View>
        </Pressable>
    )
}