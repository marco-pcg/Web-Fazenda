export function dtoErrors() {
    return {
        isNotString: () => {
            return "O valor inserido deve ser uma cadeia de caracteres";
        },
        isEmpty: () => {
            return "O campo não pode ser vazio.";
        },
        isNotBoolean: () => {
            return "O campo deve ser um booleano.";
        },
        isNotArray: () => {
            return "O campo deve ser um array.";
        },
        isNotUUID: () => {
            return "O campo deve ser um UUID válido.";
        }
    }
}
