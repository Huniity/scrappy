'use client';

import { getEventListTitle } from './events.config';
import type { ActivePanel, EventRecord } from './events.types';

type EventsActionsPanelProps = {
    activePanel: ActivePanel;
    selectedEvents: EventRecord[];
    onPanelChange: (panel: ActivePanel) => void;
    onRemoveEvent: (eventId: string) => void;
};

export function EventsActionsPanel({
    activePanel,
    selectedEvents,
    onPanelChange,
    onRemoveEvent,
}: EventsActionsPanelProps) {
    return (
        <div className="h-[400px] w-full rounded-md border border-[var(--border-strong)] bg-[var(--bg-secondary)]">
            <div className="flex h-full flex-col overflow-hidden p-3">
                <div className="flex shrink-0 justify-center">
                    <div className="flex rounded-md border border-[var(--border-strong)]">
                        <button
                            type="button"
                            aria-pressed={activePanel === 'actions'}
                            onClick={() => onPanelChange('actions')}
                            className={`rounded-md px-6 py-2 text-sm ${activePanel === 'actions'
                                ? 'bg-[var(--text-primary)] !text-[var(--text-inverse)]'
                                : '!text-[var(--text-primary)]'
                                }`}
                        >
                            Ações
                        </button>

                        <button
                            type="button"
                            aria-pressed={activePanel === 'details'}
                            onClick={() => onPanelChange('details')}
                            className={`rounded-md px-6 py-2 text-sm ${activePanel === 'details'
                                ? 'bg-[var(--text-primary)] !text-[var(--text-inverse)]'
                                : '!text-[var(--text-primary)]'
                                }`}
                        >
                            Detalhes
                        </button>
                    </div>
                </div>

                {activePanel === 'actions' ? (
                    <div className="flex min-h-0 flex-1 flex-col gap-4 p-3">
                        {selectedEvents.length > 0 ? (
                            <>
                                <h2 className="shrink-0 text-sm font-bold text-[var(--text-primary)]">
                                    Eventos selecionados:
                                </h2>
                                <div className="min-h-0 max-h-[180px] flex-1 overflow-y-auto max-[1450px]:max-h-[140px]">
                                    {selectedEvents.map(({ event }) => (
                                        <div
                                            key={event.id}
                                            className="flex items-center gap-2 border-b border-[var(--border-strong)] py-2"
                                        >
                                            <button
                                                type="button"
                                                aria-label={`Remover ${event.title} da seleção`}
                                                onClick={() => onRemoveEvent(event.id)}
                                                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--danger)]"
                                            >
                                                ×
                                            </button>
                                            <span className="truncate text-sm text-[var(--text-primary)]">
                                                {getEventListTitle(event.title)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex min-h-0 flex-1 items-center justify-center text-center text-sm text-[var(--text-secondary)]">
                                Selecione pelo menos um evento
                            </div>
                        )}

                        <div className="mt-auto grid w-full shrink-0 grid-cols-1 gap-2 min-[1451px]:grid-cols-3 max-[1200px]:gap-1">
                            <button
                                type="button"
                                disabled={selectedEvents.length === 0}
                                className="min-w-0 w-full whitespace-normal break-words rounded-md border border-[var(--text-primary)] bg-[var(--text-primary)] px-2 py-2 text-center text-xs font-semibold text-[var(--text-inverse)] shadow-sm transition-colors hover:bg-[var(--text-secondary)] disabled:cursor-not-allowed disabled:opacity-40 max-[1450px]:h-9 max-[1450px]:whitespace-nowrap max-[1200px]:px-1 max-[1200px]:text-[10px] max-[1200px]:leading-tight"
                            >
                                Publicar
                            </button>
                            <button
                                type="button"
                                disabled={selectedEvents.length === 0}
                                className="min-w-0 w-full whitespace-normal break-words rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-2 py-2 text-center text-xs font-semibold text-[var(--text-primary)] shadow-sm transition-colors hover:border-[var(--text-primary)] hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-40 max-[1450px]:h-9 max-[1450px]:whitespace-nowrap max-[1200px]:px-1 max-[1200px]:text-[10px] max-[1200px]:leading-tight"
                            >
                                Remover Publicação
                            </button>
                            <button
                                type="button"
                                disabled={selectedEvents.length === 0}
                                className="min-w-0 w-full whitespace-normal break-words rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-2 py-2 text-center text-xs font-semibold text-[var(--text-primary)] shadow-sm transition-colors hover:border-[var(--text-primary)] hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-40 max-[1450px]:h-9 max-[1450px]:whitespace-nowrap max-[1200px]:px-1 max-[1200px]:text-[10px] max-[1200px]:leading-tight"
                            >
                                Apagar
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="min-h-0 flex-1" />
                )}
            </div>
        </div>
    );
}
