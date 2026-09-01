import {
    type Page,
} from 'playwright';

import {
    getBolEventUrlsForDistrict,
} from '../crawlers/bol';

import {
    getViralAgendaEventUrls,
} from '../crawlers/viralAgenda';


export type CollectedEventUrl = {
    source:
    | 'bol'
    | 'viralAgenda';

    url: string;
};


function normalizeEventUrl(
    value: string
): string {
    const url =
        new URL(value);

    url.hash = '';

    url.pathname =
        url.pathname.replace(
            /\/+$/,
            ''
        );

    return url.toString();
}


export async function collectEventUrls(
    page: Page,
    viralAgendaSourceUrl: string,
): Promise<CollectedEventUrl[]> {
    const bolUrls =
        await getBolEventUrlsForDistrict(
            page,
            'Faro'
        );

    const viralAgendaUrls =
        await getViralAgendaEventUrls(
            page,
            viralAgendaSourceUrl,
        );


    const collectedUrls:
        CollectedEventUrl[] = [
            ...bolUrls.map(
                (url) => ({
                    source:
                        'bol' as const,

                    url:
                        normalizeEventUrl(
                            url
                        ),
                })
            ),

            ...viralAgendaUrls.map(
                (url) => ({
                    source:
                        'viralAgenda' as const,

                    url:
                        normalizeEventUrl(
                            url
                        ),
                })
            ),
        ];

    const uniqueUrls =
        new Map<
            string,
            CollectedEventUrl
        >();

    for (
        const item of collectedUrls
    ) {
        if (
            !uniqueUrls.has(
                item.url
            )
        ) {
            uniqueUrls.set(
                item.url,
                item
            );
        }
    }

    return [
        ...uniqueUrls.values(),
    ];
}