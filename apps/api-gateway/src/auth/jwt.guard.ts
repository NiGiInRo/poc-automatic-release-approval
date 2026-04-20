import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import jwksClient = require('jwks-rsa');
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtGuard implements CanActivate {
  private readonly logger = new Logger(JwtGuard.name);
  private readonly client: jwksClient.JwksClient;

  constructor(private readonly reflector: Reflector) {
    const keycloakUrl = process.env.KEYCLOAK_URL ?? 'http://localhost:8080';
    const realm = process.env.KEYCLOAK_REALM ?? 'poc-realm';

    this.client = jwksClient({
      jwksUri: `${keycloakUrl}/realms/${realm}/protocol/openid-connect/certs`,
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 600_000, // 10 minutos
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Rutas marcadas con @Public() quedan exentas
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Token no encontrado');
    }

    try {
      const payload = await this.verifyToken(token);
      request['user'] = payload;
      return true;
    } catch (err) {
      this.logger.warn(`Token inválido: ${(err as Error).message}`);
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  private extractToken(request: Request): string | null {
    const auth = request.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return null;
    return auth.slice(7);
  }

  private verifyToken(token: string): Promise<jwt.JwtPayload> {
    return new Promise((resolve, reject) => {
      const decoded = jwt.decode(token, { complete: true });

      if (!decoded?.header?.kid) {
        return reject(new Error('kid ausente en el header del token'));
      }

      this.client.getSigningKey(decoded.header.kid, (err, key) => {
        if (err) return reject(err);

        const publicKey = key!.getPublicKey();
        jwt.verify(
          token,
          publicKey,
          { algorithms: ['RS256'] },
          (verifyErr, payload) => {
            if (verifyErr) return reject(verifyErr);
            resolve(payload as jwt.JwtPayload);
          },
        );
      });
    });
  }
}
