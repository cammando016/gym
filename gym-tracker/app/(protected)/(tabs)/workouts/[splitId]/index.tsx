import { useSplits } from '@/hooks/useSplit';
import { Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import SplitForm from '@/forms/SplitForm';

export default function ViewSplit () {
    const { data } = useSplits();

    //Get split data
    const { splitId } = useLocalSearchParams<{ splitId: string }>();
    const split = data?.splits.find(s => s.splitId === splitId);

    //Fill form state with split data
    
    return !split ? <Text>Loading</Text> : <SplitForm existingSplit={split}/>
}