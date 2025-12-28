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

export { FormValues, SignupPayload, LogonFormValues };
