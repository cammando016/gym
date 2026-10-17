import { LogWorkoutForm } from "@/types/workouts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

export function useWorkoutDraft (sessionId: string) {
    const key = `workout_draft_${sessionId}`;
    const [draft, setDraft] = useState<LogWorkoutForm | null>(null);
    const [loaded, setLoaded] = useState<boolean>(false);

    useEffect(() => {
        let cancelled : boolean = false;
        AsyncStorage.getItem(key)
            .then(raw => {
                if (!cancelled && raw) setDraft(JSON.parse(raw));
            })
            .catch(console.error)
            .finally(() => {
                if (!cancelled) setLoaded(true);
            });
        return () => {
            cancelled = true;
        }
    }, [key]);

    const saveDraft = useCallback(
        (form: LogWorkoutForm) => AsyncStorage.setItem(key, JSON.stringify(form)),
        [key]
    );
    const clearDraft = useCallback(() => AsyncStorage.removeItem(key), [key]);

    return {
        draft,
        loaded,
        saveDraft,
        clearDraft,
    }
}