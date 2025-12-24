type WeightUnit = 'kg' | 'lb'

interface FormValues {
    name: string;
    birthDay: number;
    birthMonth: number;
    birthYear: number;
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

export { FormValues, LogonFormValues };
