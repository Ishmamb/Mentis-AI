import { IsArray, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CompleteOnboardingDto {
  @IsArray() @IsString({ each: true }) goals!: string[];
  @IsString() screenTime!: string;
  @IsArray() @IsString({ each: true }) apps!: string[];
  @IsInt() @Min(0) @Max(3) assessmentCorrect!: number;
  @IsInt() @Min(0) @Max(100) focusIndex!: number;
  @IsOptional() @IsInt() @Min(12) @Max(100) cognitiveAge?: number;
}
