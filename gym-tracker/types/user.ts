type WeightUnit = 'kg' | 'lb'

// <----- SIGN UP --------->

interface FormValues {
    name: string;
    birthday: Date;
    username: string;
    weight: string;
    weightUnit: WeightUnit;
    benchPr: string;
    squatPr: string;
    deadPr: string;
    password: string;
    confirmPassword: string;
}

interface SignupPayload {
    name: string;
    birthday: Date;
    username: string;
    weight: number;
    weightUnit: WeightUnit;
    benchPr: number;
    squatPr: number;
    deadPr: number;
    password: string;
    confirmPassword: string;
}

// <------- AUTH ------->

interface LogonFormValues {
    username: string;
    password: string;
}

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

interface ResetPasswordFormType {
    username: string,
    recoveryAnswer: string,
    newPassword: string,
    confirmNewPassword: string
}

type ResetPasswordReducerActions = 
| { type: 'UPDATE_USERNAME', value: string }
| { type: 'UPDATE_NEW_PASSWORD', value: string }
| { type: 'UPDATE_CONFIRM_PASSWORD', value: string }
| { type: 'UPDATE_RECOVERY_ANSWER', value: string }
| { type: 'RESET_FORM' }

interface ResetPasswordPayload {
    username: string,
    recoveryAnswer: string,
    newPassword: string
}

// <-------- USER -------->

interface User {
    username: string;
    name: string;
    bodyWeight: number;
    weightUnit: WeightUnit;
    showAstd: boolean;
    showPrtl: boolean;
    showRir: boolean;
    showRpe: boolean;
    recoveryQuestion: string;
}

// <------- TYPES FOR EDITING ACCOUNT FORMS ------->

interface EditAccountField<T> {
    value: T,
    hasChanged: boolean,
    error: string | undefined,
}

interface EditAccountForm {
    name: EditAccountField<string>,
    weight: EditAccountField<string>,
    weight_unit: EditAccountField<WeightUnit>,
    show_prtl_reps: EditAccountField<boolean>,
    show_astd_reps: EditAccountField<boolean>,
    show_rir: EditAccountField<boolean>,
    show_rpe: EditAccountField<boolean>,
}

interface EditAccountPayload {
    name?: string,
    weight?: number,
    weight_unit?: WeightUnit,
    show_astd_reps?: boolean,
    show_rpe?: boolean,
    show_rir?: boolean,
    show_prtl_reps?: boolean
}

export { 
    FormValues, 
    SignupPayload, 
    LogonFormValues, 
    User, 
    AuthContextType,
    WeightUnit,
    EditAccountField,
    EditAccountForm,
    EditAccountPayload,
    ResetPasswordFormType,
    ResetPasswordReducerActions,
    ResetPasswordPayload
};
