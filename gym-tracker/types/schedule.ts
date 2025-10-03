interface FormValues {
    weekday: number;
    restDay: Boolean;
    scheduledWorkout: string
}

type Weekday = {
    id: number;
    name: string;
}

export { FormValues, Weekday };
