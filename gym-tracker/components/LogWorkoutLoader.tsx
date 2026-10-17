import LogWorkout from "@/forms/LogWorkout";
import { useSession } from "@/hooks/useSession"
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { useWorkoutTemplates } from "@/hooks/useWorkoutTemplates";
import { LogWorkoutRef } from "@/types/workouts";
import { forwardRef } from "react"
import { Text, View } from "react-native";

interface Props {
    sessionId: string,
}

const LogWorkoutLoader = forwardRef<LogWorkoutRef, Props>((props, ref) => {
    const { data: session } = useSession(props.sessionId);
    const { data: templates } = useWorkoutTemplates();
    const { data: lastTrained } = useWorkoutHistory(session?.templateId);
    const { draft, loaded: draftLoaded, saveDraft, clearDraft } = useWorkoutDraft(props.sessionId);

    const template = templates?.find(w => w.workoutId === session?.templateId);

    if (!session || !template || !draftLoaded) return <View><Text>Loading Workout</Text></View>;

    return (
        <LogWorkout
            ref={ref}
            session={session}
            template={template}
            lastTrained={lastTrained}
            draft={draft}
            saveDraft={saveDraft}
            clearDraft={clearDraft}
        />
    )
});

export default LogWorkoutLoader;