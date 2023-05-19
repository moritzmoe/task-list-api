import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class TaskResponseDto {
    @ApiProperty()
    id: string

    @ApiProperty()
    name: string

    @ApiPropertyOptional()
    description?: string

    @ApiProperty()
    completed: boolean
}

export class PostTaskDto {
    @ApiProperty()
    @IsString()
    @MaxLength(64)
    name: string

    @ApiPropertyOptional()
    @IsString()
    @MaxLength(1024)
    @IsOptional()
    description?: string
}

export class PutTaskDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    @MaxLength(64)
    name: string

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    @MaxLength(1024)
    description?: string


    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    completed: boolean
}