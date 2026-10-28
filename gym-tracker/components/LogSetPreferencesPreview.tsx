import formStyles from "@/styles/formStyles";
import layoutStyles from "@/styles/layoutStyles";
import workoutStyles from "@/styles/workouts";
import { View, Text, Image } from "react-native";

interface Props {
    shownFields: {
        fieldLabel: string,
        fieldValue: string,
    }[],
}

export default function LogSetPreferencesPreview (props: Props) {
    return (
        <View style={[workoutStyles.exerciseContainer]}>
            <View style={[layoutStyles.rowFlex]}>
                <Text>X</Text>
                <View style={{flexGrow: 1, alignItems: "center"}}>
                    <Text>Exercise: Deadlift</Text>
                    <Text>Target Reps: 4 to 6</Text>
                </View>
                <Text>☰</Text>
            </View>
            <View style={[layoutStyles.rowFlex, {width: '90%'}]}>
                <View style={{flexGrow: 1, justifyContent: 'space-between'}}>
                    <Text style={[formStyles.boldText]}>Set 1</Text>
                    <View style={[layoutStyles.rowFlex, formStyles.formRow]}>
                        <View style={[formStyles.inputLabelPair]}>
                            <Text>Type: </Text>
                            <Text style={[formStyles.input]}>Working</Text>
                        </View>
                        <View style={[formStyles.inputLabelPair]}>
                            <Text>Weight: </Text>
                            <Text style={[formStyles.input]}>180</Text>
                            <Text> KGs</Text>
                        </View>
                    </View>

                    <View style={{width: '100%'}}>
                        <Text style={[formStyles.boldText]}>Reps</Text>
                        <View style={[layoutStyles.rowFlex, formStyles.formRow, {flexWrap: "wrap"}]}>
                            <View style={[formStyles.inputLabelPair, {width: '30%'}]}>
                                <Text>Full: </Text>
                                <Text style={[formStyles.input]}>5</Text>
                            </View>
                            {props.shownFields.map(sf => {
                                return (
                                    <View key={sf.fieldLabel} style={[formStyles.inputLabelPair, {width: '30%'}]}>
                                        <Text>{sf.fieldLabel}</Text>
                                        <Text style={[formStyles.input]}>{sf.fieldValue}</Text>
                                    </View>
                                )
                            })}
                        </View>
                    </View>

                    <View>
                        <Text style={[formStyles.boldText]}>Notes</Text>
                        <Text style={[formStyles.input, formStyles.inputLarge]}></Text>
                    </View>
                </View>

                <View style={[formStyles.setInteractionsContainer]}>
                    <View style={[formStyles.setInteractionButton]}>
                        <Text style={{textAlign: 'center'}}>X</Text>
                    </View>

                    <View style={{marginVertical: 5}}>
                        <Image 
                            source={require('../assets/images/liftingBeltGreen.png')}
                            borderRadius={2}
                            style={[workoutStyles.setModifier, workoutStyles.trueSetModifier]}
                        />
                        <Image 
                            source={require('../assets/images/straps.png')}
                            borderRadius={2}
                            style={[workoutStyles.setModifier]}
                        />
                    </View>

                    <View style={[formStyles.setInteractionButton]}>
                        <Text style={{textAlign: 'center'}}>+</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}