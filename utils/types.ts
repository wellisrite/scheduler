export type ScheduleRow = {
    task: string
    date: string
    hour: string
}

export type ScheduleWithStatus = ScheduleRow & {
    status: "pending"  | "in_progress"  | "done"
}

export function wrapInArray<T>(value: T): T[] {
    return [value]
}

export type ReadOnlySchedule = {
    readonly [K in keyof ScheduleRow]: ScheduleRow[K]
}

type IsString<T> = T extends string ? "yes"  : "no"

type Test1 = IsString<ScheduleRow['task']>
type Test2 = IsString<ScheduleRow>



