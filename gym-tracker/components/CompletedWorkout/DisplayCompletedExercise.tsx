import { LoggedWorkoutExerciseList, LoggedWorkoutSetList } from "@/types/workouts";
import { Text, View } from 'react-native';
import DisplayCompletedSet from "./DisplayCompletedSet";

interface Props {
    exercise: LoggedWorkoutExerciseList
}

export default function DisplayCompletedExercise (props: Props) {
    const ex = props.exercise;

    const calcSetTypeIndex = (set: LoggedWorkoutSetList) : number => {
        return ex.sets.filter(s => s.setType === set.setType).findIndex(s => s === set);
    }

    return (
        <View>
            <Text>{`${ex.exerciseIndex + 1}: ${ex.exerciseName}`}</Text>
            {ex.exerciseNotes && <Text>{`Notes: ${ex.exerciseNotes}`}</Text> }
            <Text>Sets</Text>
            {
                ex.sets.map(s => (
                    <DisplayCompletedSet 
                        key={s.setIndex.toString() + ":" + ex.exerciseId}
                        unilateralExercise={ex.exerciseIsUnilateral}
                        unilateralOption={ex.exerciseOptionalModifiers.unilateralOption}
                        beltOption={ex.exerciseOptionalModifiers.beltOption}
                        strapsOption={ex.exerciseOptionalModifiers.strapsOption}
                        set={s}
                        setTypeIndex={calcSetTypeIndex(s)}
                    />
                ))
            }
        </View>
    )
}