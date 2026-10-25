import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { httpExceptions } from 'src/common/errors-handler/http-exceptions';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
            PERMISSIONS_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        if (!user) {
            throw httpExceptions().forbidden();
        }

        if (user?.perfil === 'admin') {
            return true;
        }

        const permissoesUsuario: string[] = Array.isArray(user?.permissoes)
            ? user.permissoes
            : [];

        const usuarioTemPermissao = requiredPermissions.every((permissao) =>
            permissoesUsuario.includes(permissao),
        );

        if (!usuarioTemPermissao) {
            throw httpExceptions().forbidden();
        }

        return true;
    }
}