import { IsInt, Max, Min } from 'class-validator';
export class StartFocusDto { @IsInt() @Min(1) @Max(240) plannedMinutes!: number; }
