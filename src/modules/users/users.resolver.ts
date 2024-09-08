import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { User } from '../../graphql/models/user';
import { CreateUserInput } from './usersDto/createUserInput';
import { UserService } from './users.services';
import { UpdateUserInput } from './usersDto/updateUserInput';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/middleware/auth.guard';
import { AuthorizationGuard } from 'src/middleware/auth.middleware';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { commonResponse } from 'src/shared/common_responce';
import { saveFile } from 'src/shared/saveFile';
@Resolver(() => User)
export class UserResolver {
  constructor(private userService: UserService) {}

  //create user
  @Mutation(() => User)
  @UseGuards(AuthorizationGuard)
  async createUser(@Args('createUserData') createUserData: CreateUserInput) {
    return this.userService.createUser(createUserData);
  }

  //update  user
  @Mutation(() => User)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async updateUser(@Args('updateUserData') updateUserData: UpdateUserInput) {
    return this.userService.updateUser(updateUserData);
  }

  //delete user
  @Query(() => User)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async deleteUser(@Args('id', { type: () => Int }) id: number) {
    return this.userService.deleteUser(id);
  }

  //delete bulk user or single user
  @Query(() => commonResponse)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async deleteBulkUser(@Args('ids', { type: () => [Int] }) ids: number[]) {
    return this.userService.deleteBulkUser(ids);
  }

  //get user details by id
  @Query(() => User, { nullable: true })
  @UseGuards(AuthorizationGuard, AuthGuard)
  async getUserById(@Args('id', { type: () => Int }) id: number) {
    return this.userService.getUserById(id);
  }

  //get uasers
  @Query(() => [User])
  @UseGuards(AuthorizationGuard, AuthGuard)
  async getUsers() {
    return this.userService.getUsers();
  }

  //upload profile picture
  @Mutation(() => String)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async uploadProfilePic(
    @Args({ name: 'userId', type: () => Int }) userId: number,
    @Args({ name: 'image', type: () => GraphQLUpload }) image: FileUpload,
  ): Promise<string> {
    const { createReadStream, filename } = await image;
    const imagePath = await saveFile(createReadStream, filename);
    return imagePath;
  }
}
