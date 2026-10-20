import { LoggedWorkoutSetList } from "@/types/workouts";
import { Text, View } from "react-native";

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
                        <View style={{display: 'flex', flexDirection: 'row', gap: 5}}>
                            {s.reps.left.fullReps > 0 && <Text>{`Full: ${s.reps.left.fullReps}`}</Text> }
                            {s.reps.left.prtlReps > 0 && <Text>{`Partial: ${s.reps.left.prtlReps}`}</Text> }
                            {s.reps.left.astdReps > 0 && <Text>{`Assisted: ${s.reps.left.astdReps}`}</Text> }

                        </View>

                        <Text>Right Reps</Text>
                        <View style={{display: 'flex', flexDirection: 'row', gap: 5}}>
                            {s.reps.right.fullReps > 0 && <Text>{`Full: ${s.reps.right.fullReps}`}</Text> }
                            {s.reps.right.prtlReps > 0 && <Text>{`Partial: ${s.reps.right.prtlReps}`}</Text> }
                            {s.reps.right.astdReps > 0 && <Text>{`Assisted: ${s.reps.right.astdReps}`}</Text> }
                        </View>
                    </View>
                ) : 
                (
                    <View>
                        <Text>Reps</Text>
                        <View style={{display: 'flex', flexDirection: 'row', gap: 5}}>
                            {s.reps.fullReps > 0 && <Text>{`Full: ${s.reps.fullReps}`}</Text>}
                            {s.reps.prtlReps > 0 && <Text>{`Full: ${s.reps.prtlReps}`}</Text>}
                            {s.reps.astdReps > 0 && <Text>{`Full: ${s.reps.astdReps}`}</Text>}
                        </View>
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