

type LocalityContext = {
    longitude?: string;
    region?: string;
};

function toEnumName(value: string):
    string {
    return value
        .trim()
        .replace(/[()]/g, '')
        .split(/[\s-]+/)
        .filter(Boolean)
        .map((word) => {
            const lower =
                word.toLocaleLowerCase('pt-PT');

            return (
                lower.charAt(0).toLocaleUpperCase('pt-PT') + lower.slice(1)
            );
        })
        .join('');
}

export function toApiLocalityName(
    municipality: string,
    context: LocalityContext = {},
): string {
    const value = municipality.trim();
    const key =
        value.toLocaleLowerCase('pt-PT');

    const longitude = context.longitude === undefined ? undefined : Number(context.longitude);
    const isAzores = context.region === 'PT20' ||
        (
            Number.isFinite(longitude) && longitude! < -20
        );

    const isMadeira = context.region === 'PT30' ||
        (
            Number.isFinite(longitude) && longitude! > -18.5 && longitude! < -15
        );

    switch (key) {
        case 'lagoa':
            if (isAzores) {
                return 'LagoaAçores';
            }

            if (
                Number.isFinite(longitude) && longitude! >= -20 && context.region !== 'PT30'
            ) {
                return 'LagoaAlgarve';
            }

            throw new Error(
                'Lagoa is ambiguous without valid region or coordinates.',
            );

        case 'calheta':
            if (isAzores) {
                return 'CalhetaAçores';
            }

            if (isMadeira) {
                return 'CalhetaMadeira';
            }

            throw new Error(
                'Calheta is ambiguous without valid region or coordinates.',
            );

        case 'calheta de são jorge':
            return 'CalhetaAçores';

        case 'castanheira de pêra':
        case 'castanheira de pera':
            return 'CastanheiraDePera';

        default:
            return toEnumName(value);
    }
}