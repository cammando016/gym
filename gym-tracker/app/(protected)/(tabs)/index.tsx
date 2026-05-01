import { useAuth } from '@/contexts/AuthContext';
import { useSplits, useDayOfSplit } from '@/hooks/useSplit';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { formatDateDifferenceHMS } from '@/utils/dates';
import { checkForActiveWorkout, fetchLastTrained } from '@/utils/workouts';
import React, { useMemo, useState, useCallback } from 'react';
import { Button, Pressable, StyleSheet, Text, View } from 'react-native';
import dayjs from 'dayjs';
import { useStartWorkout } from '@/hooks/useStartWorkout';
import { useFocusEffect } from '@react-navigation/native';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';

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

export default function App() {
  const today = new Date();
  const { user } = useAuth();
  const { data: splitDay, isLoading: splitDayLoading } = useDayOfSplit();
  const { data: splitsData, isLoading: splitsDataLoading } = useSplits();
  const { mutate: startWorkout, isPending } = useStartWorkout();
  const { data: workouts } = useWorkoutTemplates();
  const activeSplit = splitsData?.activeSplit;

  const workoutTemplateId = useMemo(() => {
    if (!activeSplit || (splitDay < 0)) return undefined;

    const workout = activeSplit.workouts?.[splitDay]
    return workout?.workoutId
  }, [activeSplit, splitDay]);

  const { data: lastWorkout, isLoading: lastWorkoutLoading } = useWorkoutHistory(workoutTemplateId);

  const trainedToday : boolean = useMemo(() => {
    return lastWorkout?.dateStarted.toString().slice(0, 10) === today.toISOString().slice(0, 10);
  }, [lastWorkout]) 

  const testFetch: any = async (workoutId: string) => {
    const lastTrained = await fetchLastTrained(workoutId);
    console.log(lastTrained.workout.exercises);
    lastTrained.workout.exercises.map((e: any) => e.sets.map((s: any) => console.log(s)))
    return lastTrained;
  }

  //Used to check once on page load if there is currently an active workout to show resume option if so
  const [workoutInProgress, setWorkoutInProgress] = useState<ActiveWorkout | null>(null);
  useFocusEffect(
    useCallback(() => {
      setWorkoutInProgress(null);
      const checkActive = async () => {
        const result = await checkForActiveWorkout();
        setWorkoutInProgress(result)
      }
      checkActive();
    }, [])
  );

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
                { !(splitDay < 0) && !trainedToday &&
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
                    { !(splitDay < 0) && <Text>{`${trainedToday ? 'Today\'s' : 'Last'} ${activeSplit?.workouts[splitDay].workoutName} Session`}</Text> }
                    <View>
                      { !trainedToday && <Text>{`Date Trained: ${lastWorkout.dateStarted.toString().slice(0, 10)}`}</Text> }
                      <Text>{`DURATION: ${formatDateDifferenceHMS(dayjs(lastWorkout.dateEnded).diff(dayjs(lastWorkout.dateStarted)))}`}</Text>
                    </View>
                    {
                      lastWorkout.workoutNotes && (
                        <View>
                          <Text>Notes</Text>
                          <Text>{lastWorkout.workoutNotes}</Text>
                        </View>
                      )
                    }
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