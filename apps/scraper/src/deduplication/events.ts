import { type NormalizedEvent } from "../types/events";

function normalizeTitle(title: string): string {
    return title
        .trim()
        .toLowerCase();
}

function getStartDay(startDate: string): string {
    return startDate.slice(0, 10);
}

function buildDeduplicationKey(
    event: NormalizedEvent
): string {
    const title = normalizeTitle(event.title);

    const startDay = getStartDay(event.startDate);

    const locality = (event.locality ?? "")
        .trim()
        .toLowerCase();

    return `${title}|${startDay}|${locality}`;
}

export function deduplicateEvents(
    events: NormalizedEvent[]
): NormalizedEvent[] {
    const uniqueEvents =
        new Map<string, NormalizedEvent>();

    for (const event of events) {
        const key = buildDeduplicationKey(event);

        const existingEvent =
            uniqueEvents.get(key);

        if (!existingEvent) {
            uniqueEvents.set(key, event);
            continue;
        }

        const betterEvent =
            chooseMoreCompleteEvent(
                existingEvent,
                event
            );

        uniqueEvents.set(
            key,
            betterEvent
        );
    }

    return [...uniqueEvents.values()];
}

function hasTime(date: string | undefined): boolean {
    return date?.includes("T") ?? false;
}

function chooseMoreCompleteEvent(
    current: NormalizedEvent,
    candidate: NormalizedEvent
): NormalizedEvent {
    let currentScore = 0;
    let candidateScore = 0;

    if (hasTime(current.startDate)) {
        currentScore++;
    }

    if (hasTime(candidate.startDate)) {
        candidateScore++;
    }

    if (hasTime(current.endDate)) {
        currentScore++;
    }

    if (hasTime(candidate.endDate)) {
        candidateScore++;
    }

    return candidateScore > currentScore
        ? candidate
        : current;
}