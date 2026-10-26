import { Text, View } from "react-native"

interface Props {
    reps: {
        fullReps: number,
        prtlReps: number,
        astdReps: number,
        rir: number,
        rpe: number,
    }
}

export default function DisplayCompletedReps (props: Props) {
    return (
        <View>
            <View style={{display: 'flex', flexDirection: 'row', gap: 5}}>
                {/* Full reps shown no matter what, even if 0 */}
                <Text>{`Full: ${props.reps.fullReps}`}</Text>
                {/* partial/assisted reps only shown if logged */}
                { props.reps.prtlReps > 0 && <Text>{`Partial: ${props.reps.prtlReps}`}</Text> }
                { props.reps.astdReps > 0 && <Text>{`Assisted: ${props.reps.astdReps}`}</Text> }
            </View>

            <View style={{display: 'flex', flexDirection: 'row', gap: 5}}>
                { props.reps.rpe > 0 && <Text>{`RPE: ${props.reps.rpe}`}</Text>}
                { props.reps.rir > -1 && <Text>{`RiR: ${props.reps.rir}`}</Text>}
            </View>
        </View>
    )
}