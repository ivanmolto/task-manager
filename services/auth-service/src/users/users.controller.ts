import { Controller } from "@nestjs/common";
import { MessagePattern, Payload, RpcException } from "@nestjs/microservices";
import { UsersService } from "./users.service";

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: "find_user_by_id" })
  async findById(@Payload() data: { userId: string }) {
    const user = await this.usersService.findById(data.userId);

    // NEW: The Controller now decides what to do if the user is missing
    if (!user) {
      throw new RpcException({ statusCode: 404, message: "User not found" });
    }

    return user;
  }

  @MessagePattern({ cmd: "find_user_by_email" })
  async findByEmail(@Payload() data: { email: string }) {
    // Returns null if not found - this is intentional.
    // Used for checking email availability during signup,
    // where "not found" is a valid (and expected) outcome.
    return this.usersService.findByEmail(data.email);
  }
}
