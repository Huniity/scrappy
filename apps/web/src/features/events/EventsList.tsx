'use client';

import Image from 'next/image';

import styles from './events.module.css';
import { getEventListTitle } from './events.config';
import type { EventRecord, EventView } from './events.types';
import dynamic from 'next/dynamic';

const EventMap = dynamic(
    () => import('../../components/map/eventMap'),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-full items-center
              justify-center">
                A carregar mapa...
            </div>
        ),
    },
);

type EventsListProps = {
    view: EventView;
    events: EventRecord[];
    selectedEventIds: string[];
    onToggleEventSelection: (eventId: string) => void;
    onOpenEventDetails: (eventId: string) => void;
    isActionsPanelOpen: boolean;
};

export function EventsList({
    view,
    events,
    selectedEventIds,
    onToggleEventSelection,
    onOpenEventDetails,
    isActionsPanelOpen,
}: EventsListProps) {
    return (
        <div className={`${styles.eventsPanel} w-full rounded-md border border-[var(--border-strong)] bg-[var(--bg-secondary)] shadow-sm`}>
            {view === 'map' ? (
                <div className="h-full w-full">
                    <EventMap
                        events={events}
                        onOpenEventDetails={onOpenEventDetails}
                    />
                </div>
            ) : (
                <div className="h-full overflow-y-auto rounded-md bg-[var(--surface)]">
                    {events.map(({ id, event }) => {
                        const eventDate = new Date(event.startDate);
                        const eventDateLabel = eventDate.toLocaleDateString('pt-PT', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            timeZone: 'Europe/Lisbon',
                        });
                        const eventWeekday = eventDate.toLocaleDateString('pt-PT', {
                            weekday: 'short',
                            timeZone: 'Europe/Lisbon',
                        });
                        const eventTime = eventDate.toLocaleTimeString('pt-PT', {
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZone: 'Europe/Lisbon',
                        });
                        const isSelected = selectedEventIds.includes(event.id);

                        return (
                            <div
                                key={id}
                                className={`relative flex min-h-[128px] items-center gap-3 border-b border-[var(--border-strong)] px-3 py-3 transition-colors hover:bg-[var(--surface-muted)] max-[1200px]:min-h-[112px] max-[1200px]:gap-2 max-[1200px]:px-2 max-[1200px]:py-2 ${isSelected
                                    ? 'border-l-2 border-l-[var(--primary)] bg-[var(--primary-soft)]'
                                    : ''
                                    }`}
                            >
                                <div className="flex w-7 shrink-0 justify-center">
                                    <label className="relative flex cursor-pointer items-center justify-center">
                                        <span className="sr-only">Selecionar evento</span>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => onToggleEventSelection(event.id)}
                                            aria-label={`Selecionar ${event.title}`}
                                            className="peer sr-only"
                                        />
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--border-strong)] bg-[var(--surface)] transition-colors peer-checked:border-[var(--primary)] peer-checked:bg-[var(--primary)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--primary)] peer-focus-visible:ring-offset-2">
                                            {isSelected && (
                                                <span className="h-2 w-2 rounded-full bg-[var(--text-inverse)]" />
                                            )}
                                        </span>
                                    </label>
                                </div>

                                <div className="relative h-28 w-50 shrink-0 overflow-hidden rounded-md bg-[var(--surface-muted)] max-[1200px]:h-16 max-[1200px]:w-28">
                                    {event.imageUrl ? (
                                        <Image
                                            src={event.imageUrl}
                                            alt=""
                                            fill
                                            sizes="(max-width: 1200px) 112px, 200px"
                                            className="object-cover"
                                        />
                                    ) : null}
                                </div>

                                <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                                    <h3 className={`${isActionsPanelOpen ? 'truncate' : 'break-words'} text-base font-bold text-[var(--text-primary)]`}>
                                        {isActionsPanelOpen
                                            ? getEventListTitle(event.title)
                                            : event.title}
                                    </h3>
                                    <p className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                                        <Image
                                            src="/calendar.svg"
                                            alt=""
                                            width={14}
                                            height={14}
                                        />
                                        <span>
                                            {eventDateLabel} · {eventWeekday} {eventTime}
                                        </span>
                                    </p>
                                    <p className="flex min-w-0 items-start gap-1 text-sm text-[var(--text-secondary)]">
                                        <Image
                                            src="/location.svg"
                                            alt=""
                                            width={14}
                                            height={14}
                                        />
                                        <span className="truncate">
                                            {event.location.name}
                                            <span className="block text-[var(--text-tertiary)]">
                                                {event.location.locality}
                                            </span>
                                        </span>
                                    </p>
                                </div>

                                {!isActionsPanelOpen && (
                                    <div className="flex w-28 shrink-0 justify-center">
                                        <span className="rounded-md border border-[var(--border)] bg-[var(--surface-subtle)] px-2 py-2 text-center text-xs font-semibold text-[var(--text-secondary)]">
                                            {event.type}
                                        </span>
                                    </div>
                                )}

                                <div className="flex shrink-0 items-center gap-2 max-[1450px]:flex-col max-[1450px]:gap-1">
                                    <div className="flex w-28 justify-center max-[1450px]:absolute max-[1450px]:right-3 max-[1450px]:top-3 max-[1450px]:w-auto max-[1200px]:right-2 max-[1200px]:top-2">
                                        <span
                                            className={`rounded-md border border-[var(--border-strong)] px-2 py-2 text-center text-xs font-semibold max-[1450px]:border-0 max-[1450px]:bg-transparent max-[1450px]:px-0 max-[1450px]:py-0 max-[1450px]:text-sm ${event.isPublished === true
                                                ? 'bg-[var(--surface-muted)] text-[var(--text-secondary)]'
                                                : 'bg-[var(--surface)] text-[var(--text-tertiary)]'
                                                }`}
                                        >
                                            {event.isPublished === true ? 'Publicado' : 'A publicar'}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => onOpenEventDetails(event.id)}
                                        className="flex shrink-0 items-center gap-2 rounded-md border border-[var(--primary)] px-3 py-2 text-sm font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--primary)] hover:text-white max-[1450px]:mt-5 max-[1450px]:gap-1 max-[1450px]:px-2 max-[1450px]:py-1.5 max-[1450px]:text-xs"
                                    >
                                        <span>Ver detalhes</span>
                                        <span aria-hidden="true" className="text-base leading-none">›</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
