type WeightUnit = 'kg' | 'lb'

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

interface LogonFormValues {
    username: string;
    password: string;
}

interface User {
    username: string;
    firstname: string;
}

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    login: (token: string) => void;
    logout: () => void;
}

export { FormValues, SignupPayload, LogonFormValues, User, AuthContextType };
