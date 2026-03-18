import {
  Injectable,
  OnModuleInit,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from "@nestjs/microservices";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom, timeout, catchError } from "rxjs";
import { SignUpDto, LoginDto, RefreshTokenDto, LogoutDto } from "./dto";

@Injectable()
export class AuthService implements OnModuleInit {
  private client: ClientProxy;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: this.configService.get<string>("AUTH_SERVICE_HOST", "localhost"),
        port: this.configService.get<number>("AUTH_SERVICE_PORT", 4001),
      },
    });
  }

  private async sendMessage<T>(
    pattern: { cmd: string },
    data: any,
  ): Promise<T> {
    try {
      return await firstValueFrom(
        this.client.send<T>(pattern, data).pipe(
          timeout(10000),
          catchError((error) => {
            console.error("Microservice error:", error);
            if (error.name === "TimeoutError") {
              throw new HttpException(
                "Auth service is not responding",
                HttpStatus.SERVICE_UNAVAILABLE,
              );
            }
            // Preserve the original error from the microservice
            if (error.status && error.message) {
              throw new HttpException(error.message, error.status);
            }
            throw new HttpException(
              error.message || "Auth service error",
              error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to communicate with auth service",
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async signUp(signUpDto: SignUpDto) {
    return this.sendMessage({ cmd: "signup" }, signUpDto);
  }

  async login(loginDto: LoginDto) {
    return this.sendMessage({ cmd: "login" }, loginDto);
  }

  async refresh(refreshTokenDto: RefreshTokenDto) {
    return this.sendMessage({ cmd: "refresh" }, refreshTokenDto);
  }

  async logout(logoutDto: LogoutDto) {
    return this.sendMessage(
      { cmd: "logout" },
      { refreshToken: logoutDto.refreshToken },
    );
  }

  async getUser(userId: string) {
    return this.sendMessage({ cmd: "get_user" }, { userId });
  }

  async validateToken(token: string) {
    return this.sendMessage({ cmd: "validate_token" }, { token });
  }
}
