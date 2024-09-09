import { Expose, Type } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;

  @Expose()
  fullName: string;

  @Expose()
  image: string;

  @Expose()
  refreshToken: string

  @Expose()
  @Type(() => Date) 
  createdAt: Date;

  @Expose()
  @Type(() => Date) 
  updatedAt: Date;
}
