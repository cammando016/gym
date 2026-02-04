export const validateRequiredAlphabeticalField = (value: string, fieldName: string) : string | undefined => {
    if(value === '' ||  !/^[a-zA-Z]+$/.test(value)) return `${fieldName} is required and must only contain letters.`;
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

export const validateRequiredField = (value: string, fieldName: string) : string | undefined => {
    if (value === '') return `${fieldName} must be provided`
    return undefined
}

export const validatePasswordsMatch = (password: string, confirmPassword: string) : string | undefined => {
    if (password !== confirmPassword) return 'Password does not match confirm password'
    return undefined
}