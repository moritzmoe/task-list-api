import { ApiProperty } from "@nestjs/swagger";

export class AuthResponseDto {
    @ApiProperty()
    sessionId: string;

    @ApiProperty()
    token: string;
}