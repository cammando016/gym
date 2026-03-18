import { LoggedWorkoutSet, WorkoutTemplateType } from '@/types/workouts';
import { View, Text } from 'react-native';

interface Props {
    set: LoggedWorkoutSet,
    optionalSetModifiers: {
        unilateral: boolean,
        belt: boolean,
        straps: boolean,
    },
}

export default function LogSet (props: Props) {
    console.log(props.set);
    return (
        <View>
            <Text>{`Set ${props.set.setIndex + 1}`}</Text>
            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly'}}>
                <View>
                    <Text>{`Set Type: ${props.set.setType} Weight: ${props.set.weight}`}</Text>
                    {
                        !props.set.isUnilateral ? (
                            <Text>{`Reps: Full: ${props.set.reps.fullReps} Partial: ${props.set.reps.partialReps} Assisted: ${props.set.reps.assistedReps}`}</Text>
                        ) : (
                            <View>
                                <Text>{`Left Reps: Full: ${props.set.reps.left.fullReps} Partial: ${props.set.reps.left.partialReps} Assisted: ${props.set.reps.left.assistedReps}`}</Text>
                                <Text>{`Right Reps: Full: ${props.set.reps.right.fullReps} Partial: ${props.set.reps.right.partialReps} Assisted: ${props.set.reps.right.assistedReps}`}</Text>
                            </View>
                        )
                    }
                    <Text>{`Set Notes: ${props.set.setNotes}`}</Text>
                </View>
                <View>
                    {props.optionalSetModifiers.unilateral && <Text style={{color: props.set.isUnilateral ? 'green' : 'red'}}>UL</Text>}
                    {props.optionalSetModifiers.straps && <Text style={{color: props.set.usedStraps ? 'green' : 'red'}}>ST</Text>}
                    {props.optionalSetModifiers.belt && <Text style={{color: props.set.usedBelt ? 'green' : 'red'}}>BE</Text>}
                </View>
            </View>
        </View>
    )
}