const configuredUserAgent =
    process.env.SCRAPER_USER_AGENT?.trim();

export const browserUserAgent =
    configuredUserAgent ||
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
    'Chrome/131.0.0.0 Safari/537.36';

export const browserHeaders = {
    'user-agent': browserUserAgent,
    'accept-language':
        'pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7',
};
