import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
export class CreateMoodDto {
  @IsInt() @Min(1) @Max(5) mood!: number;
  @IsOptional() @IsInt() @Min(1) @Max(5) focus?: number;
  @IsOptional() @IsInt() @Min(1) @Max(5) energy?: number;
  @IsOptional() @IsInt() @Min(1) @Max(5) stress?: number;
  @IsOptional() @IsString() note?: string;
}
