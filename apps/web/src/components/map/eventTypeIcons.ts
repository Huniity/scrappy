import type { IconNode } from 'lucide-react';

import { __iconNode as babyIcon } from 'lucide-react/dist/esm/icons/baby.mjs';
import { __iconNode as briefcaseBusinessIcon } from 'lucide-react/dist/esm/icons/briefcase-business.mjs';
import { __iconNode as clapperboardIcon } from 'lucide-react/dist/esm/icons/clapperboard.mjs';
import { __iconNode as code2Icon } from 'lucide-react/dist/esm/icons/code-xml.mjs';
import { __iconNode as circleHelpIcon } from 'lucide-react/dist/esm/icons/circle-question-mark.mjs';
import { __iconNode as dramaIcon } from 'lucide-react/dist/esm/icons/drama.mjs';
import { __iconNode as galleryHorizontalIcon } from 'lucide-react/dist/esm/icons/gallery-horizontal.mjs';
import { __iconNode as graduationCapIcon } from 'lucide-react/dist/esm/icons/graduation-cap.mjs';
import { __iconNode as handHeartIcon } from 'lucide-react/dist/esm/icons/heart-handshake.mjs';
import { __iconNode as landmarkIcon } from 'lucide-react/dist/esm/icons/landmark.mjs';
import { __iconNode as music2Icon } from 'lucide-react/dist/esm/icons/music-2.mjs';
import { __iconNode as paletteIcon } from 'lucide-react/dist/esm/icons/palette.mjs';
import { __iconNode as partyPopperIcon } from 'lucide-react/dist/esm/icons/party-popper.mjs';
import { __iconNode as presentationIcon } from 'lucide-react/dist/esm/icons/presentation.mjs';
import { __iconNode as shirtIcon } from 'lucide-react/dist/esm/icons/shirt.mjs';
import { __iconNode as shoppingBasketIcon } from 'lucide-react/dist/esm/icons/shopping-basket.mjs';
import { __iconNode as storeIcon } from 'lucide-react/dist/esm/icons/store.mjs';
import { __iconNode as tentTreeIcon } from 'lucide-react/dist/esm/icons/tent-tree.mjs';
import { __iconNode as trophyIcon } from 'lucide-react/dist/esm/icons/trophy.mjs';
import { __iconNode as utensilsIcon } from 'lucide-react/dist/esm/icons/utensils.mjs';
import { __iconNode as wrenchIcon } from 'lucide-react/dist/esm/icons/wrench.mjs';

const eventTypeIcons: Record<string, IconNode> = {
    concerto: music2Icon,
    feira: storeIcon,
    mercado: shoppingBasketIcon,
    festapopular: partyPopperIcon,
    teatro: dramaIcon,
    festival: tentTreeIcon,
    exposicao: galleryHorizontalIcon,
    cinema: clapperboardIcon,
    desporto: trophyIcon,
    gastronomia: utensilsIcon,
    workshop: wrenchIcon,
    conferencia: presentationIcon,
    infantil: babyIcon,
    business: briefcaseBusinessIcon,
    moda: shirtIcon,
    educativo: graduationCapIcon,
    patrimonio: landmarkIcon,
    social: handHeartIcon,
    cultural: paletteIcon,
    hackaton: code2Icon,
    outro: circleHelpIcon,
};

function normalizeEventType(value: string) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[\s_-]+/g, '')
        .toLocaleLowerCase('pt-PT');
}

function escapeAttribute(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function toSvgAttributeName(value: string) {
    return value
        .replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`)
        .replace(/^class-name$/, 'class');
}

function renderIconNode(iconNode: IconNode) {
    const children = iconNode
        .map(([element, attributes]) => {
            const serializedAttributes = Object.entries(attributes)
                .filter(([name]) => name !== 'key')
                .map(
                    ([name, value]) =>
                        `${toSvgAttributeName(name)}="${escapeAttribute(value)}"`,
                )
                .join(' ');

            return `<${element}${serializedAttributes ? ` ${serializedAttributes}` : ''}></${element}>`;
        })
        .join('');

    return `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${children}</svg>`;
}

export function getEventTypeIconMarkup(type: string) {
    const iconNode = eventTypeIcons[normalizeEventType(type)] ?? eventTypeIcons.outro;

    return renderIconNode(iconNode);
}
