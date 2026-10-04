import { IsIn, IsInt, Max, Min } from 'class-validator';
export class FinishFocusDto {
  @IsInt() @Min(0) @Max(240) completedMinutes!: number;
  @IsIn(['COMPLETED', 'ABANDONED']) status!: 'COMPLETED' | 'ABANDONED';
}
