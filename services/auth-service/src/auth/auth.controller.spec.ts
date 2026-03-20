import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: AuthService;

  // 1. Create a fake version of the AuthService
  const mockAuthService = {
    signUp: jest.fn(),
    login: jest.fn(),
    refreshTokens: jest.fn(),
    logout: jest.fn(),
    validateToken: jest.fn(),
    getUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      // Provide the fake service instead of the real one
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("signUp (MessagePattern: signup)", () => {
    it("should route the payload and return the exact service response", async () => {
      const dto = {
        email: "test@example.com",
        password: "password",
        name: "Test User",
      };

      // Create a specific reference object in memory
      const strictServiceResponse = {
        user: {
          id: "1",
          email: "test@example.com",
          name: "Test User",
          createdAt: new Date(),
        },
        tokens: {
          accessToken: "token",
          refreshToken: "refresh",
          expiresIn: 900,
        },
      };

      mockAuthService.signUp.mockResolvedValueOnce(strictServiceResponse);

      const result = await controller.signUp(dto);

      expect(authService.signUp).toHaveBeenCalledWith(dto);
      // Use .toBe() to ensure the controller didn't mutate the object at all
      expect(result).toBe(strictServiceResponse);
    });
  });

  describe("login (MessagePattern: login)", () => {
    it("should route the payload to authService.login", async () => {
      const dto = { email: "test@example.com", password: "password" };
      const expectedResult = {
        user: { id: "1" },
        tokens: { accessToken: "token" },
      };

      mockAuthService.login.mockResolvedValueOnce(expectedResult);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("refresh (MessagePattern: refresh)", () => {
    it("should route the payload to authService.refreshTokens", async () => {
      const dto = { refreshToken: "some_refresh_token" };
      const expectedResult = {
        accessToken: "new_access",
        refreshToken: "new_refresh",
      };

      mockAuthService.refreshTokens.mockResolvedValueOnce(expectedResult);

      const result = await controller.refresh(dto);

      expect(authService.refreshTokens).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("logout (MessagePattern: logout)", () => {
    it("should extract the token and route to authService.logout", async () => {
      const payload = { refreshToken: "some_refresh_token" };
      const expectedResult = { success: true };

      mockAuthService.logout.mockResolvedValueOnce(expectedResult);

      const result = await controller.logout(payload);

      // Notice we check that it passes ONLY the string, not the whole object
      expect(authService.logout).toHaveBeenCalledWith(payload.refreshToken);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("validateToken (MessagePattern: validate_token)", () => {
    it("should extract the token and route to authService.validateToken", async () => {
      const payload = { token: "some_access_token" };
      const expectedResult = { sub: "user_123", type: "access" };

      mockAuthService.validateToken.mockResolvedValueOnce(expectedResult);

      const result = await controller.validateToken(payload);

      expect(authService.validateToken).toHaveBeenCalledWith(payload.token);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("getUser (MessagePattern: get_user)", () => {
    it("should extract the userId and route to authService.getUser", async () => {
      const payload = { userId: "user_123" };
      const expectedResult = { id: "user_123", email: "test@example.com" };

      mockAuthService.getUser.mockResolvedValueOnce(expectedResult);

      const result = await controller.getUser(payload);

      expect(authService.getUser).toHaveBeenCalledWith(payload.userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("Error Handling", () => {
    it("should propagate service errors without swallowing them", async () => {
      const dto = { email: "test@example.com", password: "password" };
      const error = new Error("Database connection failed");

      // Tell the fake service to throw an error
      mockAuthService.login.mockRejectedValueOnce(error);

      // Verify the controller lets the error pass through
      await expect(controller.login(dto)).rejects.toThrow(error);
    });
  });
});
