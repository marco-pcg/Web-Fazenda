import { ConflictException, HttpStatus, NotFoundException } from "@nestjs/common";

export function httpExceptions() {
    return {
        conflict: () => {
            return new ConflictException({ status: HttpStatus.CONFLICT, message: 'O recurso já existe.' });
        },
        notFound: () => {
            return new NotFoundException({ status: HttpStatus.NOT_FOUND, message: 'Recurso não encontrado.' });
        }
    }
}