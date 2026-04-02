import { useAuth } from '@/contexts/AuthContext';
import workoutStyles from '@/styles/workouts';
import { LoggedWorkoutExercise, LoggedWorkoutSet } from '@/types/workouts';
import { View, Text, Image, Pressable } from 'react-native';
import layoutStyles from '../styles/layoutStyles'

interface Props {
    lastTrainedExercise: LoggedWorkoutExercise,
    activeSetIndex: number,
}

export default function LastTrainedSet(props: Props) {
    const { user } = useAuth();
    return (
        <View style={[layoutStyles.rowFlex]}>
            <View>
                <View style={[layoutStyles.rowFlex]}>
                    <Text>Last {props.lastTrainedExercise.sets[props.activeSetIndex].setType} Set {props.lastTrainedExercise.sets[props.activeSetIndex].setIndex + 1} </Text>
                    <Text>{props.lastTrainedExercise.sets[props.activeSetIndex].weight} KG/LB</Text>
                </View>
                {props.lastTrainedExercise.sets[props.activeSetIndex].isUnilateral ? (
                    <View>
                        <View style={[layoutStyles.rowFlex]}>
                            <Text>L:</Text>
                            {/* Always show full reps even if 0 */}
                            <Text>Full Reps: {props.lastTrainedExercise.sets[props.activeSetIndex].reps.left.fullReps}</Text>
                            {/* Only show partial or assisted reps if any logged */}
                            {/* Show partial or assisted reps for both sides, if either side has any logged */}
                            { props.lastTrainedExercise.sets[props.activeSetIndex].reps.left.partialReps || props.lastTrainedExercise.sets[props.activeSetIndex].reps.right.partialReps &&
                                <Text>Partials: {props.lastTrainedExercise.sets[props.activeSetIndex].reps.left.partialReps}</Text>
                            }
                            { props.lastTrainedExercise.sets[props.activeSetIndex].reps.left.assistedReps || props.lastTrainedExercise.sets[props.activeSetIndex].reps.right.assistedReps &&
                                <Text>Assisted: {props.lastTrainedExercise.sets[props.activeSetIndex].reps.left.assistedReps}</Text>
                            }
                        </View>
                        <View>
                            <Text>R:</Text>
                            {/* Always show full reps even if 0 */}
                            <Text>Full Reps: {props.lastTrainedExercise.sets[props.activeSetIndex].reps.right.fullReps}</Text>
                            {/* Only show partial or assisted reps if any logged */}
                            {/* Show partial or assisted reps for both sides, if either side has any logged */}
                            { props.lastTrainedExercise.sets[props.activeSetIndex].reps.left.partialReps || props.lastTrainedExercise.sets[props.activeSetIndex].reps.right.partialReps &&
                                <Text>Partials: {props.lastTrainedExercise.sets[props.activeSetIndex].reps.right.partialReps}</Text>
                            }
                            { props.lastTrainedExercise.sets[props.activeSetIndex].reps.left.assistedReps || props.lastTrainedExercise.sets[props.activeSetIndex].reps.right.assistedReps &&
                                <Text>Assisted: {props.lastTrainedExercise.sets[props.activeSetIndex].reps.right.assistedReps}</Text>
                            }
                        </View>
                    </View>
                ) : (
                    <View style={[layoutStyles.rowFlex]}>
                        {/* Always show full reps even if 0 */}
                        <Text>Full Reps: {props.lastTrainedExercise.sets[props.activeSetIndex].reps.fullReps} </Text>
                        {/* Only show partial or assisted if any logged */}
                        { props.lastTrainedExercise.sets[props.activeSetIndex].reps.partialReps && <Text>Partials: {props.lastTrainedExercise.sets[props.activeSetIndex].reps.partialReps} </Text> }
                        { props.lastTrainedExercise.sets[props.activeSetIndex].reps.assistedReps && <Text>Assisted: {props.lastTrainedExercise.sets[props.activeSetIndex].reps.assistedReps} </Text> }
                    </View>
                )}
                { props.lastTrainedExercise.sets[props.activeSetIndex].setNotes && <Text>Notes: {props.lastTrainedExercise.sets[props.activeSetIndex].setNotes}</Text> }
            </View>
            { (props.lastTrainedExercise.sets[props.activeSetIndex].usedBelt || props.lastTrainedExercise.sets[props.activeSetIndex].usedStraps) &&
                <View style={[layoutStyles.rowFlex, {justifyContent: 'flex-end'}]}>
                    { props.lastTrainedExercise.sets[props.activeSetIndex].usedStraps && 
                        <Image
                            source={require('../assets/images/strapsGreen.png')}
                            borderRadius={2}
                            style={[workoutStyles.setModifier ,workoutStyles.trueSetModifier]}
                        />
                    }
                    { props.lastTrainedExercise.sets[props.activeSetIndex].usedBelt && 
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