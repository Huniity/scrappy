'use client';

import Image from 'next/image';

import { getEventListTitle } from './events.config';
import type { EventRecord, EventView } from './events.types';

type EventsListProps = {
    view: EventView;
    events: EventRecord[];
    selectedEventIds: string[];
    onToggleEventSelection: (eventId: string) => void;
};

export function EventsList({
    view,
    events,
    selectedEventIds,
    onToggleEventSelection,
}: EventsListProps) {
    return (
        <div className="h-[400px] w-full rounded-md border border-[var(--border-strong)] bg-[var(--bg-secondary)]">
            {view === 'map' ? (
                <div className="">

                </div>
            ) : (
                <div className="h-full overflow-y-auto rounded-md bg-[var(--surface)]">
                    {events.map(({ id, event }) => {
                        const eventDate = new Date(event.startDate);
                        const eventDateLabel = eventDate.toLocaleDateString('pt-PT', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                        });
                        const eventWeekday = eventDate.toLocaleDateString('pt-PT', {
                            weekday: 'short',
                        });
                        const eventTime = eventDate.toLocaleTimeString('pt-PT', {
                            hour: '2-digit',
                            minute: '2-digit',
                        });
                        const isSelected = selectedEventIds.includes(event.id);

                        return (
                            <div
                                key={id}
                                className={`flex min-h-[128px] items-center gap-3 border-b border-[var(--border-strong)] px-3 py-3 transition-colors hover:bg-[var(--surface-muted)] max-[1200px]:min-h-[112px] max-[1200px]:gap-2 max-[1200px]:px-2 max-[1200px]:py-2 ${isSelected
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
                                    <h3 className="truncate text-sm font-bold text-[var(--text-primary)]">
                                        {getEventListTitle(event.title)}
                                    </h3>
                                    <p className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                                        <Image
                                            src="/calendar.svg"
                                            alt=""
                                            width={13}
                                            height={13}
                                        />
                                        <span>
                                            {eventDateLabel} · {eventWeekday} {eventTime}
                                        </span>
                                    </p>
                                    <p className="flex min-w-0 items-start gap-1 text-xs text-[var(--text-secondary)]">
                                        <Image
                                            src="/location.svg"
                                            alt=""
                                            width={13}
                                            height={13}
                                        />
                                        <span className="truncate">
                                            {event.location.name}
                                            <span className="block text-[var(--text-tertiary)]">
                                                {event.location.locality}
                                            </span>
                                        </span>
                                    </p>
                                </div>

                                <div className="flex w-28 shrink-0 justify-center">
                                    <span
                                        className={`rounded-md border border-[var(--border-strong)] px-2 py-2 text-center text-[11px] font-semibold ${event.isPublished === true
                                            ? 'bg-[var(--surface-muted)] text-[var(--text-secondary)]'
                                            : 'bg-[var(--surface)] text-[var(--text-tertiary)]'
                                            }`}
                                    >
                                        {event.isPublished === true ? 'Publicado' : 'A publicar'}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    className="flex shrink-0 items-center gap-2 rounded-md border border-[var(--primary)] px-3 py-2 text-xs font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--primary)] hover:text-white"
                                >
                                    <span>Ver detalhes</span>
                                    <span aria-hidden="true" className="text-base leading-none">›</span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
