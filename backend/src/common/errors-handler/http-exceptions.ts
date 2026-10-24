import { ConflictException, HttpStatus, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";

export function httpExceptions() {
    return {
        conflict: () => {
            return new ConflictException({ status: HttpStatus.CONFLICT, message: 'O recurso já existe.' });
        },
        notFound: () => {
            return new NotFoundException({ status: HttpStatus.NOT_FOUND, message: 'Recurso não encontrado.' });
        },
        forbidden: () => {
            return new ForbiddenException({ status: HttpStatus.FORBIDDEN, message: 'Você não tem permissão para realizar esta operação.' });
        },
        badRequest: () => {
            return new BadRequestException({ status: HttpStatus.BAD_REQUEST, message: 'Requisição inválida.' });
        }
    }
}