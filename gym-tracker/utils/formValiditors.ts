type ValidationResult = 
    | { isInvalid: true; error?: string; }
    | { isInvalid: false };

export const validateRequiredAlphabeticalField = (value: string, fieldName: string) : ValidationResult => {
    if(value === '' ||  !/^[a-zA-Z]+$/.test(value)) {
        return {
            isInvalid: true,
            error: `${fieldName} is required and must only contain letters.`
        }
    } else return {isInvalid: false}
}

export const validateRequiredAlphanumbericSymbolsField = (value: string, fieldName: string) : ValidationResult => {
    if (value === '' || !/^[a-zA-Z0-9,_/&\\s]*$/.test(value)) {
        return {
            isInvalid: true,
            error: `${fieldName} is required containing only alphanumeric and "_ / , &" special characters`
        }
    } else return {isInvalid: false}
}

export const validateRequiredAlphanumericField = (value: string, fieldName: string) : ValidationResult => {
    if (value === '' || !/^[a-zA-Z0-9]+$/.test(value)) {
        return {
            isInvalid : true,
            error: `${fieldName} is required and must only contain alphanumeric characters`
        }
    } else return {isInvalid: false}
}

export const validateOptionalNumericField = (value: string, fieldName: string) : ValidationResult => {
    //Field is allowed to be empty, don't test isNaN if empty
    if (value === '') return {isInvalid: false}
    
    if (Number.isNaN(Number(value))) {
        return {
            isInvalid: true,
            error: `${fieldName} must be a number`
        }
    } else return {isInvalid: false}
}

export const validateRequiredField = (value: string, fieldName: string) : ValidationResult => {
    if (value === '') {
        return {
            isInvalid: true,
            error: `${fieldName} must be provided`
        }
    } else return {isInvalid: false}
}

export const validatePasswordsMatch = (password: string, confirmPassword: string) : ValidationResult => {
    if (password !== confirmPassword) {
        return {
            isInvalid: true,
            error: 'Password does not match confirm password'
        }
    } else return {isInvalid: false}
}