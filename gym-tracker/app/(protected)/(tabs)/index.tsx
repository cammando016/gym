import { useAuth } from '@/contexts/AuthContext';
import { useSplits, useDayOfSplit } from '@/hooks/useSplit';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { formatDateDifferenceHMS } from '@/utils/dates';
import { fetchLastTrained } from '@/utils/workouts';
import React, { useMemo } from 'react';
import { Button, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import dayjs from 'dayjs';

const styles = StyleSheet.create({
  colflex: {
    display: 'flex',
    flexDirection: 'column'
  },
  rowflex: {
    display: 'flex',
    flexDirection: 'row'
  }
})

export default function App() {
  const { user } = useAuth();
  const { data: splitDay, isLoading: splitDayLoading } = useDayOfSplit();
  const { data: splitsData, isLoading: splitsDataLoading } = useSplits();
  const activeSplit = splitsData?.activeSplit;

  const workoutTemplateId = useMemo(() => {
    if (!activeSplit || !splitDay) return undefined;

    const workout = activeSplit.workouts?.[splitDay]
    return workout?.workoutId
  }, [activeSplit, splitDay]);

  const { data: lastWorkout, isLoading: lastWorkoutLoading } = useWorkoutHistory(workoutTemplateId);

  const testFetch: any = async (workoutId: string) => {
    const lastTrained = await fetchLastTrained(workoutId);
    console.log(lastTrained.workout.exercises);
    lastTrained.workout.exercises.map(e => e.sets.map(s => console.log(s)))
    return lastTrained;
  }

  return (
    <ScrollView style={styles.colflex} >
      {
        splitDayLoading || splitsDataLoading || lastWorkoutLoading ? (
          <View>
            <Text>Loading Homepage</Text>
          </View>
        ) : (
          <View>
            <View>
              <Text>Hi, {user?.name}</Text>
            </View>

            <View style={styles.rowflex}>
              { splitDay && <Button title={`Quickstart ${activeSplit?.workouts[splitDay].workoutName}`} /> }
              <Pressable onPress={() => testFetch(workoutTemplateId)}><Text>MANUAL START</Text></Pressable>
            </View>

            <View style={styles.colflex} >
              { splitDay && <Text>{`Last ${activeSplit?.workouts[splitDay].workoutName} Session`}</Text> }
              <View>
                <Text>{`Date Trained: ${lastWorkout.datestarted.toString().slice(0, 10)}`}</Text>
                <Text>{`DURATION: ${formatDateDifferenceHMS(dayjs(lastWorkout.dateended).diff(dayjs(lastWorkout.datestarted)))}`}</Text>
              </View>
              <Text>Last Session Notes</Text>
              <Text>{lastWorkout.workoutnotes}</Text>
            </View>

            <View style={styles.rowflex}>
              <Button title='Prior Workouts' />
              <Button title='Saved Workouts' />
            </View>

            <View style={styles.colflex}>
              <Text>Schedule</Text>
              { splitDay && <Text>{`Today: ${activeSplit?.workouts[splitDay].workoutName}`}</Text> }
              {
                splitDay && splitDay + 1 !== activeSplit?.workouts.length ? (
                  <Text>{`Tomorrow: ${activeSplit?.workouts[splitDay + 1].workoutName}`}</Text>
                ) : (
                  <Text>{`Tomorrow: ${activeSplit?.workouts[0].workoutName}`}</Text>
                )
              }
            </View>

            <View style={styles.rowflex}>
              <Text>Y</Text>
              <Text>Y</Text>
              <Text>N</Text>
              <Text>Y</Text>
              <Text>Y</Text>
              <Text>Y</Text>
              <Text>3</Text>
            </View>

            <View style={styles.rowflex}>
              <View>
                <Button title='Goals' />
                <Text>Last Earned</Text>
                <Text>Almost There</Text>
              </View>
              <View>
                <Button title='Badges' />
                <Text>Last Earned</Text>
                <Text>Almost There</Text>
              </View>
            </View>
          </View>
      )}
    </ScrollView>
  )
}