import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
export class CreateGoalDto {
  @IsString() title!: string;
  @IsString() category!: string;
  @IsInt() @Min(1) @Max(100000) target!: number;
  @IsString() unit!: string;
  @IsOptional() @IsString() frequency?: string;
  @IsOptional() @IsString() deadline?: string;
}
