'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';

import { EventCounter } from '@/components/statCards/countEvent';
import { HasCoordsCounter } from '@/components/statCards/hasCoords';
import { FreeEventCounter } from '@/components/statCards/freeEvent';
import { PublishedEventCounter } from '@/components/statCards/addedEvent';

type StatCardProps = {
    label: string;
    icon: string;
    iconAlt: string;
    iconWidth: number;
    iconHeight: number;
    iconClassName: string;
    counter: ReactNode;
    footer?: ReactNode;
};

function StatCard({
    label,
    icon,
    iconAlt,
    iconWidth,
    iconHeight,
    iconClassName,
    counter,
    footer,
}: StatCardProps) {
    return (
        <div>
            <div className="grid h-[100px] w-full grid-cols-[2fr_5fr] rounded-md border border-[var(--border-strong)] bg-[var(--bg-secondary)] shadow-sm max-[1200px]:h-[92px]">
                <div className="relative flex h-full w-full items-center justify-center">
                    <div
                        aria-hidden="true"
                        className="absolute h-20 w-20 rounded-full bg-[var(--surface-muted)] max-[1200px]:h-16 max-[1200px]:w-16 min-[1201px]:max-[1400px]:h-16 min-[1201px]:max-[1400px]:w-16"
                    />
                    <Image
                        src={icon}
                        alt={iconAlt}
                        width={iconWidth}
                        height={iconHeight}
                        className={`relative z-10 h-auto ${iconClassName}`}
                    />
                </div>
                <div className="flex flex-col justify-center gap-1 px-2">
                    <p className="text-md font-bold text-[var(--text-secondary)]">
                        <span className="max-[1540px]:block">Eventos</span>{' '}
                        {label.replace(/^Eventos\s*/, '')}
                    </p>
                    {counter}
                    {footer}
                </div>
            </div>
        </div>
    );
}

export function EventsStats() {
    return (
        <div className="grid w-full grid-cols-4 justify-center gap-4 max-[1200px]:gap-3">
            <StatCard
                label="Eventos encontrados"
                icon="/calendar.svg"
                iconAlt="Evento"
                iconWidth={40}
                iconHeight={40}
                iconClassName="w-10 min-[1201px]:max-[1400px]:w-9"
                counter={<EventCounter />}
                footer={(
                    <p className="text-sm font-bold text-[var(--text-tertiary)]">
                        neste periodo
                    </p>
                )}
            />
            <StatCard
                label="Eventos com coordenadas"
                icon="/location.svg"
                iconAlt="Evento"
                iconWidth={44}
                iconHeight={44}
                iconClassName="w-11 min-[1201px]:max-[1400px]:w-10"
                counter={<HasCoordsCounter />}
            />
            <StatCard
                label="Eventos adicionados"
                icon="/calendar-success.svg"
                iconAlt="Evento"
                iconWidth={40}
                iconHeight={40}
                iconClassName="w-10 min-[1201px]:max-[1400px]:w-9"
                counter={<PublishedEventCounter />}
            />
            <StatCard
                label="Eventos gratuitos"
                icon="/ticket.svg"
                iconAlt="Evento"
                iconWidth={40}
                iconHeight={40}
                iconClassName="w-10 min-[1201px]:max-[1400px]:w-9"
                counter={<FreeEventCounter />}
            />
        </div>
    );
}
