const enum ERRORS {
    USER_NOT_FOUND = 1,
    AZURE_KEYVAULT,
    TQ,
    AUTH,
    LOGIN
}

export const USER_NOT_FOUND: App.Error = {message: "User not found", id: ERRORS.USER_NOT_FOUND}
export const AZURE_KEYVAULT: App.Error = {message: "Couldn't connect to secure storage", id: ERRORS.AZURE_KEYVAULT}
export const TQ: App.Error = {message: "Couldn't connect to Tessitura", id: ERRORS.TQ}
export const LOGIN: App.Error = {message: "User is not logged in", id: ERRORS.LOGIN}
export const TESSITURA: App.Error = {message: "Invalid login", id: ERRORS.AUTH}
export const AUTH: App.Error = {message: "User is not authorized", id: ERRORS.AUTH}