import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { PrismaService } from "../prisma/prisma.service";

describe("UsersService", () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findById", () => {
    it("should return a user if found", async () => {
      const expectedUser = { id: "1", email: "test@example.com", name: "Test" };
      mockPrismaService.user.findUnique.mockResolvedValueOnce(expectedUser);

      const result = await service.findById("1");
      expect(result).toEqual(expectedUser);

      // 🔒 The Security Tripwire
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          // Explicitly proving password is NOT here
        },
      });
    });

    it("should return null if user is not found (no exception)", async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

      const result = await service.findById("999");
      // We expect null instead of an error!
      expect(result).toBeNull();
    });
  });

  describe("findByEmail", () => {
    it("should return a user if found", async () => {
      const expectedUser = { id: "1", email: "test@example.com", name: "Test" };
      mockPrismaService.user.findUnique.mockResolvedValueOnce(expectedUser);

      // We pass uppercase to ensure the service lowers it
      const result = await service.findByEmail("TEST@example.com");
      expect(result).toEqual(expectedUser);

      // 🔒 The Security Tripwire
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" }, // Verifies toLowerCase worked
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it("should return null if user is not found", async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

      const result = await service.findByEmail("nonexistent@example.com");
      expect(result).toBeNull();
    });
  });
});
