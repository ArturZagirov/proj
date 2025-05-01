import { IsEmail, IsNotEmpty, IsInt, IsString, MinLength, MaxLength, Min } from 'class-validator'

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    login: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;

    @IsNotEmpty()
    @IsInt()
    age: number;

    @IsString()
    @MaxLength(1000)
    description?: string;
}