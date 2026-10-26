import { LoggedWorkoutSetList } from "@/types/workouts";
import { Text, View } from "react-native";
import DisplayCompletedReps from "./DisplayCompletedReps";

interface Props {
    unilateralExercise: boolean,
    unilateralOption: boolean,
    strapsOption: boolean,
    beltOption: boolean,
    set: LoggedWorkoutSetList,
    setTypeIndex: number,
}

export default function DisplayCompletedSet(props: Props) {
    const s : LoggedWorkoutSetList = props.set;
    return (
        <View>
            <Text>{`${s.setType} Set ${props.setTypeIndex + 1}`}</Text>
            <Text>{`Weight: ${s.setWeight}`}</Text>
            {
                s.setIsUnilateral ? 
                (
                    <View>
                        <Text>Left Reps</Text>
                        <DisplayCompletedReps reps={s.reps.left} />

                        <Text>Right Reps</Text>
                        <DisplayCompletedReps reps={s.reps.right} />
                    </View>
                ) : 
                (
                    <View>
                        <Text>Reps</Text>
                        <DisplayCompletedReps reps={s.reps} />
                    </View>
                )
            }
            {s.setNotes && <Text>{`Set Notes: ${s.setNotes}`}</Text>}
            <View style={{display: 'flex', flexDirection: 'row', gap: 5}}>
                {(props.unilateralOption || props.unilateralExercise) && <Text style={{color: s.setIsUnilateral || props.unilateralExercise ? 'green' : 'red'}}>UL</Text>}
                {props.beltOption && <Text style={{color: s.setUsedBelt ? 'green' : 'red'}}>BE</Text>}
                {props.strapsOption && <Text style={{color: s.setUsedStraps ? 'green' : 'red'}}>ST</Text>}
            </View>
        </View>
    )
}