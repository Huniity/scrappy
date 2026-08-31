const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';

export function getEventSource(url: string): string {
    try {
        return new URL(url).hostname.includes('bol.pt')
            ? 'BOL'
            : 'VIRALAGENDA';
    } catch {
        return 'UNKNOWN';
    }
}

export function getEventId(url: string): string {
    const match = url.match(
        /\/(?:pt\/events|Comprar\/Bilhetes)\/(\d+)/i,
    );

    return match?.[1] ?? url;
}

export function logEventFound(url: string, count: number): void {
    console.log(
        `${GREEN}Event found - ${getEventSource(url)} ` +
        `- ID: ${getEventId(url)} - [${count}]${RESET}`,
    );
}

export function logCrawlFinished(): void {
    console.log(`${GREEN}Crawl finished${RESET}`);
}

export function logDuplicatedEvent(
    url: string,
    reason: string,
): void {
    console.log(
        `${YELLOW}Duplicated event - ${getEventSource(url)} ` +
        `- ID: ${getEventId(url)} - [${reason}]${RESET}`,
    );
}

export function logError(message: string, error?: unknown): void {
    const details = error instanceof Error
        ? error.stack ?? error.message
        : error === undefined
            ? ''
            : String(error);

    console.error(
        `${RED}${message}${details ? ` ${details}` : ''}${RESET}`,
    );
}
