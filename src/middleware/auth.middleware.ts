import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GqlExecutionContext } from '@nestjs/graphql';
import configuration from 'config/configuration';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const { req } = gqlContext.getContext();
    if (!req) {
      throw new UnauthorizedException('AuthGuard requires a GraphQL context');
    }

    const token = this.extractTokenFromHeader(req);
    if (!token) {
      throw new UnauthorizedException('Authorization token not provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: configuration().jwtSecret,
      });
      req.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired Authorization token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const authorizationHeader = request.headers?.authorization;
    if (!authorizationHeader) {
      return undefined;
    }
    const [type, token] = authorizationHeader.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
