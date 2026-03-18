import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";

// 1. Mock external libraries
jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password"),
  compare: jest.fn().mockResolvedValue(true),
}));

describe("AuthService", () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  // 2. Comprehensive fake versions of our dependencies
  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue("mock_token"),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key.includes("EXPIRATION")) return "15m";
      return "test_secret";
    }),
  };

  // 3. Setup the testing module before each test runs
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    // Clear all mocks before each test to ensure a clean slate
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(authService).toBeDefined();
  });

  describe("signUp", () => {
    const signUpDto = {
      email: "test@example.com",
      password: "Password123!",
      name: "Test User",
    };

    it("should throw ConflictException if user already exists", async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: "1",
        email: signUpDto.email,
      });

      await expect(authService.signUp(signUpDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it("should successfully hash the password and create a user", async () => {
      const mockUser = {
        id: "user_123",
        email: signUpDto.email,
        name: signUpDto.name,
        createdAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.user.create.mockResolvedValueOnce(mockUser);

      const result = await authService.signUp(signUpDto);

      // Verify Bcrypt hashed the password before sending to database
      expect(bcrypt.hash).toHaveBeenCalledWith(signUpDto.password, 12);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          password: "hashed_password", // Ensures plain password isn't saved
          email: signUpDto.email,
          name: signUpDto.name,
        }),
      });

      // Verify the returned data
      expect(result.user.email).toEqual(signUpDto.email);
      expect(result.user.name).toEqual(signUpDto.name);
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.expiresIn).toBe(900); // 15 minutes in seconds
    });
  });

  describe("login", () => {
    const loginDto = {
      email: "test@example.com",
      password: "Password123!",
    };

    it("should throw UnauthorizedException if user is not found", async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException if password is wrong", async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: "1",
        email: loginDto.email,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should successfully login and return tokens", async () => {
      const mockUser = {
        id: "user_123",
        email: loginDto.email,
        password: "hashed_password",
        createdAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const result = await authService.login(loginDto);

      expect(result.tokens.accessToken).toEqual("mock_token");
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe("refreshTokens", () => {
    const refreshTokenDto = { refreshToken: "some_refresh_token" };
    const mockTokenPayload = {
      sub: "user_123",
      email: "test@example.com",
      type: "refresh",
    };

    it("should throw UnauthorizedException for an invalid token signature", async () => {
      mockJwtService.verify.mockImplementationOnce(() => {
        throw new Error("Invalid token");
      });

      await expect(authService.refreshTokens(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should detect token reuse and revoke all user tokens", async () => {
      // Simulate verifying the token successfully, but finding it marked as 'revoked' in the DB
      mockJwtService.verify.mockReturnValueOnce(mockTokenPayload);
      mockPrismaService.refreshToken.findUnique.mockResolvedValueOnce({
        id: "token_123",
        userId: "user_123",
        revoked: true, // REUSE DETECTED!
        expiresAt: new Date(Date.now() + 100000),
        user: { email: "test@example.com" },
      });

      await expect(authService.refreshTokens(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );

      // Ensure the security mechanism fired to wipe all the user's sessions
      expect(mockPrismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: "user_123" },
        data: { revoked: true },
      });
    });

    it("should rotate tokens on successful refresh", async () => {
      mockJwtService.verify.mockReturnValueOnce(mockTokenPayload);
      mockPrismaService.refreshToken.findUnique.mockResolvedValueOnce({
        id: "token_123",
        userId: "user_123",
        revoked: false,
        expiresAt: new Date(Date.now() + 100000), // Future date
        user: { email: "test@example.com" },
      });

      const result = await authService.refreshTokens(refreshTokenDto);

      // Verify the old token was revoked (Rotation)
      expect(mockPrismaService.refreshToken.update).toHaveBeenCalledWith({
        where: { id: "token_123" },
        data: { revoked: true },
      });

      // Verify new tokens were issued
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
  });
  describe("logout", () => {
    it("should revoke the refresh token", async () => {
      await authService.logout("some_refresh_token");

      expect(mockPrismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { token: "some_refresh_token" },
        data: { revoked: true },
      });
    });
  });

  describe("validateToken", () => {
    it("should return payload for valid access token", async () => {
      mockJwtService.verify.mockReturnValueOnce({
        sub: "user_123",
        type: "access",
      });
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: "user_123",
      });

      const result = await authService.validateToken("valid_token");

      expect(result).toEqual(expect.objectContaining({ sub: "user_123" }));
    });

    it("should return null for refresh token type", async () => {
      mockJwtService.verify.mockReturnValueOnce({
        sub: "user_123",
        type: "refresh",
      });

      const result = await authService.validateToken("refresh_token");

      expect(result).toBeNull();
    });
  });

  describe("getUser", () => {
    it("should return user if found", async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: "user_123",
        email: "test@example.com",
        name: "Test User",
        createdAt: new Date(),
      });

      const result = await authService.getUser("user_123");

      expect(result?.email).toBe("test@example.com");
    });

    it("should return null if user not found", async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

      const result = await authService.getUser("nonexistent");

      expect(result).toBeNull();
    });
  });
});
