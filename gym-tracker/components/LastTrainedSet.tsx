import { useAuth } from '@/contexts/AuthContext';
import workoutStyles from '@/styles/workouts';
import { LoggedWorkoutSet } from '@/types/workouts';
import { View, Text, Image } from 'react-native';
import layoutStyles from '../styles/layoutStyles'

interface Props {
    lastTrainedSet?: LoggedWorkoutSet,
    activeSetIndex: number,
}

export default function LastTrainedSet(props: Props) {
    const { user } = useAuth();
    return (
        <View style={[layoutStyles.rowFlex]}>
            {
                props.lastTrainedSet === undefined ? (
                    <View><Text>No matching set from past workout </Text></View>
                ) : (
                    <View>
                        <View>
                            <View style={[layoutStyles.rowFlex]}>
                                <Text>Last {props.lastTrainedSet.setType} Set {props.activeSetIndex + 1} </Text>
                                <Text>{props.lastTrainedSet.weight} KG/LB</Text>
                            </View>
                            {props.lastTrainedSet.isUnilateral ? (
                                <View>
                                    <View style={[layoutStyles.rowFlex]}>
                                        <Text>L:</Text>
                                        {/* Always show full reps even if 0 */}
                                        <Text>Full Reps: {props.lastTrainedSet.reps.left.fullReps}</Text>
                                        {/* Only show partial or assisted reps if any logged */}
                                        {/* Show partial or assisted reps for both sides, if either side has any logged */}
                                        { (!!props.lastTrainedSet.reps.left.partialReps || !!props.lastTrainedSet.reps.right.partialReps) &&
                                            <Text>Partials: {props.lastTrainedSet.reps.left.partialReps}</Text>
                                        }
                                        { (!!props.lastTrainedSet.reps.left.assistedReps || !!props.lastTrainedSet.reps.right.assistedReps) &&
                                            <Text>Assisted: {props.lastTrainedSet.reps.left.assistedReps}</Text>
                                        }
                                    </View>
                                    <View>
                                        <Text>R:</Text>
                                        {/* Always show full reps even if 0 */}
                                        <Text>Full Reps: {props.lastTrainedSet.reps.right.fullReps}</Text>
                                        {/* Only show partial or assisted reps if any logged */}
                                        {/* Show partial or assisted reps for both sides, if either side has any logged */}
                                        { (!!props.lastTrainedSet.reps.left.partialReps || !!props.lastTrainedSet.reps.right.partialReps) &&
                                            <Text>Partials: {props.lastTrainedSet.reps.right.partialReps}</Text>
                                        }
                                        { (!!props.lastTrainedSet.reps.left.assistedReps || !!props.lastTrainedSet.reps.right.assistedReps) &&
                                            <Text>Assisted: {props.lastTrainedSet.reps.right.assistedReps}</Text>
                                        }
                                    </View>
                                </View>
                            ) : (
                                <View style={[layoutStyles.rowFlex]}>
                                    {/* Always show full reps even if 0 */}
                                    <Text>Full Reps: {props.lastTrainedSet.reps.fullReps} </Text>
                                    {/* Only show partial or assisted if any logged */}
                                    { (!!props.lastTrainedSet.reps.partialReps) && <Text>Partials: {props.lastTrainedSet.reps.partialReps} </Text> }
                                    { (!!props.lastTrainedSet.reps.assistedReps) && <Text>Assisted: {props.lastTrainedSet.reps.assistedReps} </Text> }
                                </View>
                            )}
                            { props.lastTrainedSet.setNotes && <Text>Notes: {props.lastTrainedSet.setNotes}</Text> }
                        </View>
                        { 
                            (props.lastTrainedSet.usedBelt || props.lastTrainedSet.usedStraps) &&
                                <View style={[layoutStyles.rowFlex, {justifyContent: 'flex-end'}]}>
                                    { props.lastTrainedSet.usedStraps && 
                                        <Image
                                            source={require('../assets/images/strapsGreen.png')}
                                            borderRadius={2}
                                            style={[workoutStyles.setModifier ,workoutStyles.trueSetModifier]}
                                        />
                                    }
                                    { props.lastTrainedSet.usedBelt && 
                                        <Image 
                                            source={require('../assets/images/liftingBeltGreen.png')}
                                            borderRadius={2}
                                            style={[workoutStyles.setModifier ,workoutStyles.trueSetModifier]}
                                        />
                                    }
                                </View>
                        }
                    </View>
                )
            }
        </View>
    )
}