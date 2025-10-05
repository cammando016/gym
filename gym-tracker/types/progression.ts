type GoalType = '1RM' | 'Weight for Reps' | 'Weight Gain' | 'Weight Loss' | 'Cardio Milestone'

interface Goal {
    goalType: GoalType;
    target: string | number;
    targetDay: number;
    targetMonth: number;
    targetYear: number;
}

export { Goal };
