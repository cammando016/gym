import { formatDateDifferenceHMS } from "@/utils/dates";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react"
import { Text } from "react-native";

interface Props {
    active: boolean,
    duration: number,
    dateResumed: string | null,
    dateStarted: string,
}

export default function LogWorkoutTimer ( props : Props) {
    const [text, setText] = useState<string>('');

    useEffect(() => {
        if (!props.active) return;

        const baseMs : number = props.duration * 1000;
        const anchorDate : Dayjs = dayjs(props.dateResumed ?? props.dateStarted);

        let timeout: ReturnType<typeof setTimeout>;

        const tick = () => {
            const elapsedMs = baseMs + dayjs().diff(anchorDate);
            setText(formatDateDifferenceHMS(elapsedMs));
            timeout = setTimeout(tick, 1000 - (elapsedMs % 1000) + 5);
        }
        tick();

        return () => clearTimeout(timeout);
    }, [props.active, props.duration, props.dateResumed, props.dateStarted]);

    return <Text style={{ color: 'white', textAlign: 'center' }}>{text}</Text>
}