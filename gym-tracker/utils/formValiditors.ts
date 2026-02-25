export const validateRequiredAlphabeticalField = (value: string, fieldName: string) : string | undefined => {
    if(value === '' ||  !/^[a-zA-Z]+$/.test(value)) return `${fieldName} is required and must only contain letters.`;
    return undefined;
}

export const validateRequiredAlphabeticalSpacesField = (value: string, fieldName: string) : string | undefined => {
    if (value === '' || !/^[a-zA-Z\s]*$/.test(value)) return `${fieldName} is required and may only contain letters and spaces`;
    return undefined;
}

export const validateRequiredAlphanumericSymbolsField = (value: string, fieldName: string) : string | undefined => {
    if (value === '' || !/^[a-zA-Z0-9,_/&\s]*$/.test(value)) return `${fieldName} is required containing only alphanumeric and "_ / , &" special characters`
    return undefined
}

export const validateRequiredAlphanumericField = (value: string, fieldName: string) : string | undefined => {
    if (value === '' || !/^[a-zA-Z0-9]+$/.test(value)) return `${fieldName} is required and must only contain alphanumeric characters`
    return undefined
}

export const validateOptionalNumericField = (value: string, fieldName: string) : string | undefined => {
    //Field is allowed to be empty, don't test isNaN if empty
    if (value === '') return undefined;
    
    if (Number.isNaN(Number(value))) return `${fieldName} must be a number`
    return undefined
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