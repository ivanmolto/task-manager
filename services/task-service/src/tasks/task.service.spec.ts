import { Test, TestingModule } from "@nestjs/testing";
import { RpcException } from "@nestjs/microservices";
import { TasksService } from "./tasks.service";
import { PrismaService } from "../prisma/prisma.service";
import { TaskStatus, SortBy, SortOrder } from "./dto";

// 1. Fully mock the Prisma Service
const mockPrismaService = {
  task: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe("TasksService", () => {
  let service: TasksService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Crucial: Reset mock history after every single test!
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // --- CREATE ---
  describe("create", () => {
    it("should successfully create a task", async () => {
      const taskDto = { title: "Test", description: "Desc", userId: "user-1" };
      const expectedTask = { id: "task-1", ...taskDto };

      prisma.task.create.mockResolvedValue(expectedTask);

      const result = await service.create(taskDto);

      expect(result).toEqual(expectedTask);
      expect(prisma.task.create).toHaveBeenCalledWith({ data: taskDto });
    });
  });

  // --- FIND ALL ---
  describe("findAll", () => {
    it("should return paginated tasks with default filters", async () => {
      const queryDto = { userId: "user-1" };
      const mockTasks = [{ id: "task-1", title: "Test" }];

      // Promise.all runs these concurrently, so we mock both
      prisma.task.findMany.mockResolvedValue(mockTasks);
      prisma.task.count.mockResolvedValue(1);

      const result = await service.findAll(queryDto);

      expect(result.data).toEqual(mockTasks);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "user-1" },
          skip: 0,
          take: 10, // Default limit
        }),
      );
    });

    it("should apply status and search filters correctly", async () => {
      const queryDto = {
        userId: "user-1",
        status: TaskStatus.COMPLETED,
        search: "urgent",
      };

      prisma.task.findMany.mockResolvedValue([]);
      prisma.task.count.mockResolvedValue(0);

      await service.findAll(queryDto);

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: "user-1",
            completed: true, // Derived from TaskStatus.COMPLETED
            OR: [
              { title: { contains: "urgent", mode: "insensitive" } },
              { description: { contains: "urgent", mode: "insensitive" } },
            ],
          }),
        }),
      );
    });
  });

  // --- FIND ONE ---
  describe("findOne", () => {
    it("should return a task if it exists and belongs to the user", async () => {
      const mockTask = { id: "task-1", userId: "user-1", title: "Test" };
      prisma.task.findUnique.mockResolvedValue(mockTask);

      const result = await service.findOne({
        taskId: "task-1",
        userId: "user-1",
      });

      expect(result).toEqual(mockTask);
    });

    it("should throw RpcException (404) if task does not exist", async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne({ taskId: "invalid-id", userId: "user-1" }),
      ).rejects.toThrow(RpcException);
    });

    it("should throw RpcException (403) if task belongs to a different user", async () => {
      // Task belongs to user-2, but user-1 is requesting it!
      const mockTask = { id: "task-1", userId: "user-2", title: "Test" };
      prisma.task.findUnique.mockResolvedValue(mockTask);

      await expect(
        service.findOne({ taskId: "task-1", userId: "user-1" }),
      ).rejects.toThrow(RpcException);
    });
  });

  // --- UPDATE ---
  describe("update", () => {
    it("should update a task successfully", async () => {
      const existingTask = { id: "task-1", userId: "user-1", title: "Old" };
      const updateDto = { taskId: "task-1", userId: "user-1", title: "New" };

      prisma.task.findUnique.mockResolvedValue(existingTask);
      prisma.task.update.mockResolvedValue({ ...existingTask, title: "New" });

      const result = await service.update(updateDto);

      expect(result.title).toBe("New");
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: "task-1" },
        data: { title: "New" },
      });
    });

    it("should set completedAt when completed is set to true", async () => {
      const existingTask = { id: "task-1", userId: "user-1", completed: false };
      const updateDto = { taskId: "task-1", userId: "user-1", completed: true };

      prisma.task.findUnique.mockResolvedValue(existingTask);
      prisma.task.update.mockResolvedValue({
        ...existingTask,
        completed: true,
      });

      await service.update(updateDto);

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: "task-1" },
        data: expect.objectContaining({
          completed: true,
          completedAt: expect.any(Date), // Checks that a Date object was passed!
        }),
      });
    });

    it("should throw RpcException if task not found during update", async () => {
      prisma.task.findUnique.mockResolvedValue(null);
      await expect(
        service.update({ taskId: "task-1", userId: "user-1" }),
      ).rejects.toThrow(RpcException);
    });
  });

  // --- REMOVE ---
  describe("remove", () => {
    it("should delete a task successfully", async () => {
      const existingTask = { id: "task-1", userId: "user-1" };

      prisma.task.findUnique.mockResolvedValue(existingTask);
      prisma.task.delete.mockResolvedValue(existingTask);

      const result = await service.remove({
        taskId: "task-1",
        userId: "user-1",
      });

      expect(result).toEqual({
        success: true,
        message: "Task deleted successfully",
      });
      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: "task-1" },
      });
    });

    it("should throw RpcException (403) if trying to delete another users task", async () => {
      const existingTask = { id: "task-1", userId: "user-2" }; // Belongs to user-2
      prisma.task.findUnique.mockResolvedValue(existingTask);

      await expect(
        service.remove({ taskId: "task-1", userId: "user-1" }),
      ).rejects.toThrow(RpcException);

      // Ensure delete was NEVER called
      expect(prisma.task.delete).not.toHaveBeenCalled();
    });
  });
  describe("toggleComplete", () => {
    it("should toggle completed from false to true", async () => {
      const existingTask = { id: "task-1", userId: "user-1", completed: false };
      prisma.task.findUnique.mockResolvedValue(existingTask);
      prisma.task.update.mockResolvedValue({
        ...existingTask,
        completed: true,
        completedAt: new Date(),
      });

      const result = await service.toggleComplete({
        taskId: "task-1",
        userId: "user-1",
      });

      expect(result.completed).toBe(true);
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: "task-1" },
        data: {
          completed: true,
          completedAt: expect.any(Date),
        },
      });
    });

    it("should toggle completed from true to false and clear completedAt", async () => {
      const existingTask = {
        id: "task-1",
        userId: "user-1",
        completed: true,
        completedAt: new Date(),
      };
      prisma.task.findUnique.mockResolvedValue(existingTask);
      prisma.task.update.mockResolvedValue({
        ...existingTask,
        completed: false,
        completedAt: null,
      });

      const result = await service.toggleComplete({
        taskId: "task-1",
        userId: "user-1",
      });

      expect(result.completed).toBe(false);
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: "task-1" },
        data: {
          completed: false,
          completedAt: null,
        },
      });
    });

    it("should throw RpcException (403) if task belongs to another user", async () => {
      const existingTask = { id: "task-1", userId: "user-2", completed: false };
      prisma.task.findUnique.mockResolvedValue(existingTask);

      await expect(
        service.toggleComplete({ taskId: "task-1", userId: "user-1" }),
      ).rejects.toThrow(RpcException);

      expect(prisma.task.update).not.toHaveBeenCalled();
    });
  });
  describe("getStats", () => {
    it("should return correct statistics", async () => {
      prisma.task.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(7) // completed
        .mockResolvedValueOnce(3); // pending

      const result = await service.getStats("user-1");

      expect(result).toEqual({
        total: 10,
        completed: 7,
        pending: 3,
        completionRate: 70,
      });
    });

    it("should return 0% completion rate when no tasks exist", async () => {
      prisma.task.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const result = await service.getStats("user-1");

      expect(result).toEqual({
        total: 0,
        completed: 0,
        pending: 0,
        completionRate: 0, // Avoids division by zero!
      });
    });
  });
});
