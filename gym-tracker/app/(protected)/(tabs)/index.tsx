import { useAuth } from '@/contexts/AuthContext';
import { useSplits, useDayOfSplit } from '@/hooks/useSplit';
import React from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';

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

interface Props {
  session: string, 
  lastDate: Date, 
  lastDuration: number, 
  lastNotes: string
}

export default function App() {
  const { user } = useAuth();
  const { data: splitDay } = useDayOfSplit();
  const { data : active } = useSplits();
  const activeSplit = active?.activeSplit;
  return (
    <ScrollView style={styles.colflex} >
      <View>
        <Text>Hi, {user?.name}</Text>
      </View>

      <View style={styles.rowflex}>
        { splitDay && <Button title={`Quickstart ${activeSplit?.workouts[splitDay].workoutName}`} /> }
        <Button title='Manual Start Workout' />
      </View>

      <View style={styles.colflex} >
        { splitDay && <Text>{`Last ${activeSplit?.workouts[splitDay].workoutName} Session`}</Text> }
        <View>
          <Text>LAST TRAINED SESSION</Text>
          <Text>LAST TRAINED DURATION</Text>
        </View>
        <Text>LAST TRAINED NOTES</Text>
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
    </ScrollView>
  )
}