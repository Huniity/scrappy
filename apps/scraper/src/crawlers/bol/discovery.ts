import {
    type Page,
} from 'playwright';

export async function getBolEventUrlsForDistrict(
    page: Page,
    district: string
): Promise<string[]> {
    const searchUrl =
        'https://www.bol.pt/Comprar/pesquisa/0-0-8-0-0-0/bilhetes_para_espectaculos_em_faro';

    await page.goto(searchUrl, {
        waitUntil: 'domcontentloaded',
    });

    const urls =
        await page
            .locator(
                'a[href*="/Comprar/Bilhetes/"]'
            )
            .evaluateAll((links) =>
                links
                    .map(
                        (link) =>
                            (
                                link as HTMLAnchorElement
                            ).href
                    )
                    .filter((href) => {
                        const url =
                            new URL(href);

                        return /^\/Comprar\/Bilhetes\/\d+-[^/]+\/?$/i.test(
                            url.pathname
                        );
                    })
            );

    return [
        ...new Set(urls),
    ];
}