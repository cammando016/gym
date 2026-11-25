export const validateRequiredAlphabeticalField = (value: string, fieldName: string) : string | undefined => {
    if(value === '' ||  !/^[a-zA-Z]+$/.test(value)) return `${fieldName} is required and must only contain letters.`;
    return undefined;
}

export const validateRequiredAlphabeticalSpacesField = (value: string, fieldName: string) : string | undefined => {
    if (value === '' || !/^[a-zA-Z\s]*$/.test(value)) return `${fieldName} is required and may only contain letters and spaces`;
    return undefined;
}

export const validateRequiredAlphanumericSymbolsField = (value: string, fieldName: string) : string | undefined => {
    if (value === '' || !/^[a-zA-Z0-9,._/&\s]*$/.test(value)) return `${fieldName} is required containing only alphanumeric or _ / & . , special characters`
    return undefined
}

export const validateRequiredAlphanumericField = (value: string, fieldName: string) : string | undefined => {
    if (value === '' || !/^[a-zA-Z0-9]+$/.test(value)) return `${fieldName} is required and must only contain alphanumeric characters`
    return undefined
}

export const validateOptionalAlphanumericSymbolsField = (value: string, fieldName: string) : string | undefined => {
    if (!/^[a-zA-Z0-9,:._/&\s]*$/.test(value)) return `${fieldName} must only contain alphanumeric or _ / : & . , special characters`
}

export const validateOptionalNumericField = (value: string, fieldName: string) : string | undefined => {
    //Field is allowed to be empty, don't test isNaN if empty
    if (value === '') return undefined;
    
    if (Number.isNaN(Number(value))) return `${fieldName} must be a number`
    return undefined
}

export const validateRequiredNumericField = (value: string, fieldName: string) : string | undefined => {
    if (Number.isNaN(Number(value))) return `${fieldName} must be a number`;
    return undefined;
}

export const validateOptionalIntegerField = (value: string, fieldName: string) : string | undefined => {
    //Field is allowed to be empty, don't test isNaN if empty
    if (value === '' || value == null) return undefined;
    //Regex for whole number (only numerical characters)
    if (!/^\d+$/.test(value)) return `${fieldName} must be a whole number`;
    return undefined;
}

export const validateRequiredField = (value: string, fieldName: string) : string | undefined => {
    if (value === '') return `${fieldName} must be provided`
    return undefined
}

export const validatePasswordsMatch = (password: string, confirmPassword: string) : string | undefined => {
    if (password !== confirmPassword) return 'Password does not match confirm password'
    return undefined
}

export const validateUpperRepsTarget = (upper?: string, lower?: string) : string | undefined => {
    const isUpperEmpty = upper === '' || upper == null;
    const isLowerEmpty = lower === '' || lower == null;

    if (!isLowerEmpty && isUpperEmpty) return 'Upper reps target is required when lower reps is set';
    if (!isUpperEmpty && !/^\d+$/.test(upper)) return 'Upper reps must be a whole number';
    if (!isUpperEmpty && !isLowerEmpty && (Number(upper) < Number(lower))) return 'Upper reps target cannot be smaller than lower reps target';

    return undefined;
}

export const validateNameField = (input: string, fieldName: string) : string | undefined => {
    const normalisedInput = input.normalize('NFC');
    if (normalisedInput.trim() === '') return `${fieldName} is required`;
    if (!/^\p{L}+([-.']\p{L}+)*$/u.test(normalisedInput.trim())) return `Invalid format for ${fieldName}`
    if (normalisedInput.length > 50) return `${fieldName} may not be longer than 50 characters`

    return undefined
}

export const checkPwdRegex = (pwd: string) : string | undefined => {
    const missingPwdComponents: string[] = [];
    if (!/[a-z]/.test(pwd)) missingPwdComponents.push('lowercase letter');
    if (!/[A-Z]/.test(pwd)) missingPwdComponents.push('uppercase letter');
    if (!/[0-9]/.test(pwd)) missingPwdComponents.push('number');
    if (!/[^\w\s]/.test(pwd)) missingPwdComponents.push('symbol');

    const validLength : boolean = pwd.length > 7 && pwd.length < 65;

    if (validLength && missingPwdComponents.length === 0) return undefined;

    const errorStringParts : string[] = [];
    if (!validLength) errorStringParts.push('be between 8-64 characters');
    if (missingPwdComponents.length > 0) errorStringParts.push(`contain at least one ${missingPwdComponents.join(', ')}`);

    return `Password must ${errorStringParts.join(' and ')}.`;
}