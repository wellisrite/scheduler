import {ScheduleRow, ScheduleWithStatus} from "./types";

// parse hour string [10-12] to [10, 12]
function parseHourRange(hour: string): [number, number]  {
    const [start, end] = hour.split("-").map(Number)
    return [start, end]
}

export function determineTaskStatus (
    task: ScheduleRow,
    currentHour: number
): ScheduleWithStatus {
    const [start, end] = parseHourRange(task.hour)
    let status: "pending" | "in_progress" | "done"

    if (currentHour < start) {
        status = "pending"
    } else if (currentHour >= start && currentHour <= end) {
        status = "in_progress"
    } else {
        status = "done"
    }

    return {
        ...task,
        status
    }
}

export function assignStatuses (
    tasks: ScheduleRow[],
    currentHour: number
): ScheduleWithStatus[] {
    return tasks.map((task) => determineTaskStatus(task, currentHour))
}