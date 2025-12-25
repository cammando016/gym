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
  username: string, 
  session: string, 
  lastDate: Date, 
  lastDuration: number, 
  lastNotes: string
}

const HomePage = ( props: Props ) => {
    return (
      <ScrollView style={styles.colflex} >
        <View>
          <Text>Hi, {props.username}</Text>
        </View>

        <View style={styles.rowflex}>
          <Button title={`Quickstart ${props.session}`} />
          <Button title='Manual Start Workout' />
        </View>

        <View style={styles.colflex} >
          <Text>Last {props.session} Session</Text>
          <View>
            <Text>{props.lastDate.toDateString()}</Text>
            <Text>{props.lastDuration}</Text>
          </View>
          <Text>{props.lastNotes}</Text>
        </View>

        <View style={styles.rowflex}>
          <Button title='Prior Workouts' />
          <Button title='Saved Workouts' />
        </View>

        <View style={styles.colflex}>
          <Text>Schedule</Text>
          <Text>Today: {props.session}</Text>
          <Text>Tomorrow: Rest Day</Text>
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

export default function App() {
  return (
    <HomePage
      username='Cameron'
      session='Chest & Back'
      lastDate={new Date()}
      lastDuration={54.5}
      lastNotes='good session, go up in weights'
    ></HomePage>
  )
}