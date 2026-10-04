import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
export class LogGoalDto {
  @IsInt() @Min(1) @Max(100000) value!: number;
  @IsOptional() @IsString() note?: string;
}
