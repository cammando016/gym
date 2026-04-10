import { useAuth } from '@/contexts/AuthContext';
import { useSplits, useDayOfSplit } from '@/hooks/useSplit';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { formatDateDifferenceHMS } from '@/utils/dates';
import { checkForActiveWorkout, fetchLastTrained } from '@/utils/workouts';
import React, { useMemo, useEffect, useState } from 'react';
import { Button, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import dayjs from 'dayjs';
import { Link } from 'expo-router';
import { useStartWorkout } from '@/hooks/useStartWorkout';

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

interface ActiveWorkout {
  workout: { id: string, dateStarted: string, workoutName: string }
}

export default async function App() {
  const { user } = useAuth();
  const { data: splitDay, isLoading: splitDayLoading } = useDayOfSplit();
  const { data: splitsData, isLoading: splitsDataLoading } = useSplits();
  const { mutate: startWorkout, isPending } = useStartWorkout();
  const activeSplit = splitsData?.activeSplit;

  const workoutTemplateId = useMemo(() => {
    if (!activeSplit || (splitDay < 0)) return undefined;

    const workout = activeSplit.workouts?.[splitDay]
    return workout?.workoutId
  }, [activeSplit, splitDay]);

  const { data: lastWorkout, isLoading: lastWorkoutLoading } = useWorkoutHistory(workoutTemplateId);

  const testFetch: any = async (workoutId: string) => {
    const lastTrained = await fetchLastTrained(workoutId);
    console.log(lastTrained.workout.exercises);
    lastTrained.workout.exercises.map((e: any) => e.sets.map((s: any) => console.log(s)))
    return lastTrained;
  }

  //Used to check once on page load if there is currently an active workout to show resume option if so
  const [workoutInProgress, setWorkoutInProgress] = useState<ActiveWorkout | null>(null);
  useEffect(() => {
    const checkActive = async () => {
      const result = await checkForActiveWorkout();
      setWorkoutInProgress(result);
    }
    checkActive();
  }, []);

  console.log(workoutInProgress);

  return (
    <View style={[styles.colflex, {flex: 1}]} >
      {
        !splitsData ? (
          <View>
            <Text>Loading Homepage</Text>
          </View>
        ) : (
          <View style={{flex: 1}}>
            <View style={{flex: 1}}>
              <View>
                <Text>Hi, {user?.name}</Text>
              </View>

              <View style={styles.rowflex}>
                { !(splitDay < 0) && 
                  <Pressable
                    onPress={ () => startWorkout(`${workoutTemplateId}`) }
                    disabled={isPending}
                  >
                    <Text>
                      {
                        isPending ? 'Starting Workout...' : `Quickstart ${activeSplit?.workouts[splitDay].workoutName}`
                      }
                    </Text>
                  </Pressable>
                }
                <Pressable onPress={() => testFetch(workoutTemplateId)}><Text>MANUAL START</Text></Pressable>
              </View>

              {
                lastWorkout ? (
                  <View style={styles.colflex} >
                    { !(splitDay < 0) && <Text>{`Last ${activeSplit?.workouts[splitDay].workoutName} Session`}</Text> }
                    <View>
                      <Text>{`Date Trained: ${lastWorkout.dateStarted.toString().slice(0, 10)}`}</Text>
                      <Text>{`DURATION: ${formatDateDifferenceHMS(dayjs(lastWorkout.dateEnded).diff(dayjs(lastWorkout.dateStarted)))}`}</Text>
                    </View>
                    <Text>Last Session Notes</Text>
                    <Text>{lastWorkout.workoutNotes}</Text>
                  </View>
                ) : (
                  <Text>No previous workouts from this template.</Text>
                )
              }

              <View style={styles.rowflex}>
                <Button title='Prior Workouts' />
                <Button title='Saved Workouts' />
              </View>

              <View style={styles.colflex}>
                <Text>Schedule</Text>
                { !(splitDay < 0) && <Text>{`Today: ${activeSplit?.workouts[splitDay].workoutName}`}</Text> }
                {
                  !(splitDay < 0) && splitDay + 1 !== activeSplit?.workouts.length ? (
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

            { workoutInProgress && (
              <View style={{backgroundColor: '#619888', padding: 5}}>
                <Pressable onPress={() => alert('RESUME WORKOUT')}>
                  <Text style={{textAlign: 'center'}}>Resume {workoutInProgress.workout.workoutName} workout started on {workoutInProgress.workout.dateStarted.slice(0, 10)} ?</Text>
                </Pressable>
              </View>
            )}
          </View>
      )}
    </View>
  )
}