export function formatReservationTime24(time: string): string {
    const trimmed = time.trim();
    if (!trimmed) return time;

    const twentyFourHourMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (twentyFourHourMatch) {
        const hours = Number(twentyFourHourMatch[1]);
        const minutes = twentyFourHourMatch[2];

        if (Number.isInteger(hours) && hours >= 0 && hours <= 23) {
            return `${String(hours).padStart(2, "0")}:${minutes}`;
        }
    }

    const amPmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
    if (amPmMatch) {
        let hours = Number(amPmMatch[1]);
        const minutes = amPmMatch[2];
        const period = amPmMatch[3].toUpperCase();

        if (hours >= 1 && hours <= 12) {
            if (period === "AM") {
                hours = hours === 12 ? 0 : hours;
            } else {
                hours = hours === 12 ? 12 : hours + 12;
            }

            return `${String(hours).padStart(2, "0")}:${minutes}`;
        }
    }

    return time;
}

export function buildTimeOptions(stepMinutes = 10): string[] {
    const options: string[] = [];

    for (let hour = 0; hour <= 23; hour += 1) {
        for (let minute = 0; minute < 60; minute += stepMinutes) {
            options.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
        }
    }

    return options;
}