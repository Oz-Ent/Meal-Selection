export enum DayOfWeek {
    Monday = 1,
    Tuesday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5
}

export  const days = Object.keys(DayOfWeek).filter(key => Number.isNaN(Number(key)));