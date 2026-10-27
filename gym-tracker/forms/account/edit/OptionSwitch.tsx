import layoutStyles from "@/styles/layoutStyles";
import { Text, View } from "react-native";
import { Switch } from "react-native-paper";

type BooleanFields = 'showPrtl' | 'showAstd' | 'showRir' | 'showRpe';
interface Props {
    hasChanged: boolean,
    label: string,
    fieldValue: boolean,
    toggleField: (key: BooleanFields) => void,
    fieldKey: BooleanFields;
}

export default function OptionSwitch (props : Props) {
    return (
        <View style={[layoutStyles.rowFlex, {alignItems: 'center'}]}>
            <Text style={{fontWeight: props.hasChanged ? 'bold' : 'normal'}}>{props.label}</Text>
            <Switch 
                value={props.fieldValue}
                onValueChange={() => props.toggleField(props.fieldKey)}
            />
        </View>
    )
}