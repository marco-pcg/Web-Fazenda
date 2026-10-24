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
        },
        isNotInt: () => {
            return "O campo deve ser um número inteiro.";
        },
        belowTheMin: () => {
            return "É necessário que o valor seja equivalente ou superior ao mínimo permitido.";
        },
        outsideTheLength: () => {
            return "O valor deve estar dentro do tamanho permitido.";
        }
    }
}
