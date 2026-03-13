import { useSplits } from '@/hooks/useSplit';
import { View, Text } from 'react-native';

export default function ViewSplit () {
    const { data } = useSplits();
    const activeSplit = data?.activeSplit;
    
    return (
        !activeSplit ? <Text>Loading</Text> :
        <View>
            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text>{activeSplit.splitName}</Text>
                <Text>Edit Split Link</Text>
            </View>
            <Text>Workouts</Text>
            <View>
                {
                    activeSplit.workouts.map(w => {
                        return (
                            <View key={w.dayIndex}>
                                {
                                    w.restDay ? (
                                        <View style={{display: 'flex', flexDirection: 'row'}}>
                                            <Text>Day {w.dayIndex + 1}: </Text>
                                            <Text>Rest Day</Text> 
                                        </View>
                                    ) : ( 
                                        <View style={{display: 'flex', flexDirection: 'row'}}>
                                            <Text>Day {w.dayIndex + 1}: </Text>
                                            <Text>{w.workoutName}</Text> 
                                        </View>
                                    )
                                }
                            </View>
                        )
                    })
                }
            </View>
        </View>
    )
}