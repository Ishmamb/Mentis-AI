import { IsInt, Max, Min } from 'class-validator';
export class CompleteGameDto {
  @IsInt() @Min(0) @Max(100000) score!: number;
  @IsInt() @Min(1) @Max(7200) durationSec!: number;
}
