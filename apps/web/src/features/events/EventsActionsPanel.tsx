'use client';

import Image from 'next/image';
import { useEffect, useState, type ReactNode } from 'react';

import styles from './events.module.css';
import { getEventListTitle } from './events.config';
import eventsMock from './events.mock.json';
import type { ActivePanel, EventRecord } from './events.types';

type EventEntity = {
    type?: string | null;
    name?: string | null;
    url?: string | null;
    sameAs?: string | null;
    imageUrl?: string | null;
};

type EventAudience = {
    name?: string | null;
    audienceType?: string | null;
};

type EventSchedule = {
    startDate?: string | null;
    endDate?: string | null;
    startTime?: string | null;
    endTime?: string | null;
    timeZone?: string | null;
    repeatDays?: string[] | null;
};

type EventOffer = {
    name?: string | null;
    price?: number | null;
    priceCurrency?: string | null;
    url?: string | null;
    validFrom?: string | null;
};

const eventDateOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Lisbon',
};

function formatDate(value: string | null | undefined) {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString('pt-PT', eventDateOptions);
}

function formatDuration(value: string | null | undefined) {
    if (!value) {
        return null;
    }

    const match = value.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/);

    if (!match) {
        return value;
    }

    const [, days, hours, minutes, seconds] = match;
    const parts = [
        days && `${days} d`,
        hours && `${hours} h`,
        minutes && `${minutes} min`,
        seconds && `${seconds} s`,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(' ') : value;
}

function formatOfferPrice(price: number | null | undefined, currency: string | null | undefined) {
    if (price === null || price === undefined) {
        return null;
    }

    if (!currency) {
        return String(price);
    }

    try {
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency,
        }).format(price);
    } catch {
        return `${price} ${currency}`;
    }
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="flex flex-col gap-0.5 text-sm text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--text-primary)]">{label}</span>
            <div className="break-words">{children}</div>
        </div>
    );
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="flex flex-col gap-2 border-t border-[var(--border-strong)] pt-3">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>
            {children}
        </section>
    );
}

function ExternalLink({ href, children }: { href: string; children?: ReactNode }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="break-all text-[var(--primary)] underline underline-offset-2 hover:decoration-2"
        >
            {children ?? href}
        </a>
    );
}

function EntityGroup({ title, entities }: { title: string; entities: EventEntity[] }) {
    if (entities.length === 0) {
        return null;
    }

    return (
        <DetailSection title={title}>
            <div className="flex flex-col gap-2">
                {entities.map((entity, index) => (
                    <div
                        key={`${title}-${index}`}
                        className="flex flex-col gap-1 rounded-md border border-[var(--border-strong)] bg-[var(--surface)] p-2"
                    >
                        {entity.name && (
                            <span className="text-sm font-semibold text-[var(--text-primary)]">
                                {entity.name}
                            </span>
                        )}
                        {entity.type && (
                            <span className="text-sm text-[var(--text-secondary)]">
                                Tipo: {entity.type}
                            </span>
                        )}
                        {entity.url && (
                            <span className="text-sm text-[var(--text-secondary)]">
                                URL: <ExternalLink href={entity.url} />
                            </span>
                        )}
                        {entity.sameAs && (
                            <span className="text-sm text-[var(--text-secondary)]">
                                Referência: <ExternalLink href={entity.sameAs} />
                            </span>
                        )}
                        {entity.imageUrl && (
                            <span className="text-sm text-[var(--text-secondary)]">
                                Imagem: <ExternalLink href={entity.imageUrl} />
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </DetailSection>
    );
}

function AudienceGroup({ audience }: { audience: EventAudience[] }) {
    if (audience.length === 0) {
        return null;
    }

    return (
        <DetailSection title="Público-alvo">
            <div className="flex flex-col gap-2">
                {audience.map((item, index) => (
                    <div
                        key={`audience-${index}`}
                        className="rounded-md border border-[var(--border-strong)] bg-[var(--surface)] p-2 text-sm text-[var(--text-secondary)]"
                    >
                        {item.name && <div>Nome: {item.name}</div>}
                        {item.audienceType && <div>Tipo: {item.audienceType}</div>}
                    </div>
                ))}
            </div>
        </DetailSection>
    );
}

type EventsActionsPanelProps = {
    activePanel: ActivePanel;
    selectedEvents: EventRecord[];
    detailsEventId: string | null;
    isFinishedEventsAction: boolean;
    onPanelChange: (panel: ActivePanel) => void;
    onRemoveEvent: (eventId: string) => void;
    onClose: () => void;
};

export function EventsActionsPanel({
    activePanel,
    selectedEvents,
    detailsEventId,
    isFinishedEventsAction,
    onPanelChange,
    onRemoveEvent,
    onClose,
}: EventsActionsPanelProps) {
    const event = eventsMock.find(({ event }) => event.id === detailsEventId)?.event;
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isImageExpanded, setIsImageExpanded] = useState(false);
    const [expandedImageRatio, setExpandedImageRatio] = useState<number | null>(null);
    const eventDate = event ? formatDate(event.startDate) : null;
    const eventEndDate = event ? formatDate(event.endDate) : null;
    const eventDuration = event ? formatDuration(event.duration) : null;
    const eventSchedule = event?.schedule as EventSchedule | null;
    const eventOffers = (event?.offers ?? []) as EventOffer[];
    const eventAudience = (Array.isArray(event?.audience) ? event.audience : []) as EventAudience[];
    const eventOrganizers = (Array.isArray(event?.organizer) ? event.organizer : []) as EventEntity[];
    const eventPromoters = (Array.isArray(event?.promoter) ? event.promoter : []) as EventEntity[];
    const eventPerformers = (Array.isArray(event?.performers) ? event.performers : []) as EventEntity[];
    const eventMaintainers = (Array.isArray(event?.maintainer) ? event.maintainer : []) as EventEntity[];
    const eventFunders = (Array.isArray(event?.funder) ? event.funder : []) as EventEntity[];
    const eventActors = (Array.isArray(event?.actor) ? event.actor : []) as EventEntity[];
    const eventDirectors = (Array.isArray(event?.director) ? event.director : []) as EventEntity[];
    const eventComposers = (Array.isArray(event?.composer) ? event.composer : []) as EventEntity[];

    useEffect(() => {
        if (!isImageExpanded) {
            return;
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsImageExpanded(false);
            }
        }

        window.addEventListener('keydown', handleEscape);

        return () => window.removeEventListener('keydown', handleEscape);
    }, [isImageExpanded]);

    return (
        <div className={`${styles.eventsPanel} relative w-full rounded-md border border-[var(--border-strong)] bg-[var(--bg-secondary)] shadow-sm`}>
            <div className="flex h-full flex-col overflow-hidden p-3">
                <div className="relative flex shrink-0 justify-center">
                    <button
                        type="button"
                        aria-label="Fechar painel"
                        onClick={onClose}
                        className="absolute right-0 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-lg leading-none text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
                    >
                        ✕
                    </button>

                    <div className="flex rounded-md border border-[var(--border-strong)]">

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
                    </div>
                </div>

                {activePanel === 'actions' ? (
                    <div className="flex min-h-0 flex-1 flex-col gap-4 p-3">
                        {selectedEvents.length > 0 ? (
                            <>
                                <h2 className="shrink-0 text-sm font-bold text-[var(--text-primary)]">
                                    {isFinishedEventsAction
                                        ? 'Estes eventos já terminaram. Remover?'
                                        : 'Eventos selecionados:'}
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
                                disabled={isFinishedEventsAction || selectedEvents.length === 0}
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
                                disabled={isFinishedEventsAction || selectedEvents.length === 0}
                                className="min-w-0 w-full whitespace-normal break-words rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-2 py-2 text-center text-xs font-semibold text-[var(--text-primary)] shadow-sm transition-colors hover:border-[var(--text-primary)] hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-40 max-[1450px]:h-9 max-[1450px]:whitespace-nowrap max-[1200px]:px-1 max-[1200px]:text-[10px] max-[1200px]:leading-tight"
                            >
                                Apagar
                            </button>
                        </div>
                    </div>
                ) : event ? (
                

                    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-3">
                        <div className="relative aspect-[2/1] w-full shrink-0 overflow-hidden rounded-md bg-[var(--surface-muted)]">
                            <Image
                                src={event.imageUrl}
                                alt={event.title}
                                fill
                                sizes="(max-width: 1200px) 100vw, 50vw"
                                className="object-cover"
                            />
                            <button
                                type="button"
                                aria-label="Ampliar imagem do evento"
                                onClick={() => {
                                    setExpandedImageRatio(null);
                                    setIsImageExpanded(true);
                                }}
                                className="absolute bottom-2 right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/65 text-white shadow-md transition-colors hover:bg-black/80"
                            >
                                <svg
                                    aria-hidden="true"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    className="h-5 w-5"
                                >
                                    <circle cx="11" cy="11" r="6" />
                                    <path d="m16 16 4 4" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex flex-col gap-2">
                            <h2 className="text-xl font-bold leading-tight text-[var(--text-primary)]">
                                {event.title}
                            </h2>
                            {event.alternateName && (
                                <DetailRow label="Nome alternativo">{event.alternateName}</DetailRow>
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            <DetailRow label="Data de início">
                                {eventDate ?? 'Não disponível'}
                            </DetailRow>
                            {eventEndDate && (
                                <DetailRow label="Data de fim">{eventEndDate}</DetailRow>
                            )}
                            <DetailRow label="Local">
                                {event.location.name}
                            </DetailRow>
                            <DetailRow label="Rua">
                                {event.location.streetAddress ?? 'Não disponível'}
                            </DetailRow>
                            <DetailRow label="Código postal">
                                {event.location.postalCode ?? 'Não disponível'}
                            </DetailRow>
                            <DetailRow label="Fonte principal">
                                <ExternalLink href={event.sourceUrl} />
                            </DetailRow>
                            <DetailRow label="Categoria">{event.type}</DetailRow>
                            <DetailRow label="Estado">{event.status}</DetailRow>
                        </div>

                        <DetailSection title="Localização completa">
                            <div className="flex flex-col gap-3">
                                {event.location.locality && (
                                    <DetailRow label="Localidade">{event.location.locality}</DetailRow>
                                )}
                                {event.location.district && (
                                    <DetailRow label="Distrito">{event.location.district}</DetailRow>
                                )}
                                {event.location.region && (
                                    <DetailRow label="Região">{event.location.region}</DetailRow>
                                )}
                                {event.location.country && (
                                    <DetailRow label="País">{event.location.country}</DetailRow>
                                )}
                                {event.location.dicoCode && (
                                    <DetailRow label="Código DICO">{event.location.dicoCode}</DetailRow>
                                )}
                                {event.location.latitude !== null && (
                                    <DetailRow label="Latitude">{event.location.latitude}</DetailRow>
                                )}
                                {event.location.longitude !== null && (
                                    <DetailRow label="Longitude">{event.location.longitude}</DetailRow>
                                )}
                                {event.location.url && (
                                    <DetailRow label="URL do local">
                                        <ExternalLink href={event.location.url} />
                                    </DetailRow>
                                )}
                                {event.location.sameAs && (
                                    <DetailRow label="Referência do local">
                                        <ExternalLink href={event.location.sameAs} />
                                    </DetailRow>
                                )}
                            </div>
                        </DetailSection>

                        {event.sourceUrls.length > 0 && (
                            <DetailSection title="Fontes adicionais">
                                <div className="flex flex-col gap-2 text-sm text-[var(--text-secondary)]">
                                    {event.sourceUrls.map((sourceUrl, index) => (
                                        <div key={`source-${index}`}>
                                            <ExternalLink href={sourceUrl} />
                                        </div>
                                    ))}
                                </div>
                            </DetailSection>
                        )}

                        <DetailSection title="Informações adicionais">
                            <div className="flex flex-col gap-3">
                                {event.doorTime && (
                                    <DetailRow label="Hora de abertura">
                                        {formatDate(event.doorTime)}
                                    </DetailRow>
                                )}
                                {event.isAccessibleForFree !== null && (
                                    <DetailRow label="Entrada gratuita">
                                        {event.isAccessibleForFree ? 'Sim' : 'Não'}
                                    </DetailRow>
                                )}
                                <DetailRow label="Acessibilidade física">
                                    {event.physicalAccessibility ? 'Sim' : 'Não'}
                                </DetailRow>
                                {event.ageRating !== null && (
                                    <DetailRow label="Classificação etária">
                                        M/{event.ageRating}
                                    </DetailRow>
                                )}
                                {event.maximumAttendeeCapacity !== null && (
                                    <DetailRow label="Lotação máxima">
                                        {event.maximumAttendeeCapacity}
                                    </DetailRow>
                                )}
                                {event.keywords.length > 0 && (
                                    <DetailRow label="Palavras-chave">
                                        {event.keywords.join(', ')}
                                    </DetailRow>
                                )}
                                {event.attendanceMode && (
                                    <DetailRow label="Modo de participação">
                                        {event.attendanceMode}
                                    </DetailRow>
                                )}
                                {eventDuration && (
                                    <DetailRow label="Duração">{eventDuration}</DetailRow>
                                )}
                            </div>
                        </DetailSection>

                        {eventSchedule && (
                            <DetailSection title="Horário recorrente">
                                <div className="flex flex-col gap-3">
                                    {eventSchedule.startDate && (
                                        <DetailRow label="Início do horário">
                                            {formatDate(eventSchedule.startDate)}
                                        </DetailRow>
                                    )}
                                    {eventSchedule.endDate && (
                                        <DetailRow label="Fim do horário">
                                            {formatDate(eventSchedule.endDate)}
                                        </DetailRow>
                                    )}
                                    {eventSchedule.startTime && (
                                        <DetailRow label="Hora inicial">
                                            {eventSchedule.startTime}
                                        </DetailRow>
                                    )}
                                    {eventSchedule.endTime && (
                                        <DetailRow label="Hora final">
                                            {eventSchedule.endTime}
                                        </DetailRow>
                                    )}
                                    {eventSchedule.timeZone && (
                                        <DetailRow label="Fuso horário">
                                            {eventSchedule.timeZone}
                                        </DetailRow>
                                    )}
                                    {eventSchedule.repeatDays && eventSchedule.repeatDays.length > 0 && (
                                        <DetailRow label="Dias de repetição">
                                            {eventSchedule.repeatDays.join(', ')}
                                        </DetailRow>
                                    )}
                                </div>
                            </DetailSection>
                        )}

                        {eventOffers.length > 0 && (
                            <DetailSection title="Ofertas">
                                <div className="flex flex-col gap-3">
                                    {eventOffers.map((offer, index) => (
                                        <div
                                            key={`offer-${index}`}
                                            className="flex flex-col gap-3 rounded-md border border-[var(--border-strong)] bg-[var(--surface)] p-2"
                                        >
                                            <span className="text-sm font-semibold text-[var(--text-primary)]">
                                                Oferta {index + 1}
                                            </span>
                                            {offer.name && (
                                                <DetailRow label="Nome">{offer.name}</DetailRow>
                                            )}
                                            {offer.price !== null && offer.price !== undefined && (
                                                <DetailRow label="Preço">
                                                    {formatOfferPrice(offer.price, offer.priceCurrency)}
                                                </DetailRow>
                                            )}
                                            {offer.priceCurrency && (
                                                <DetailRow label="Moeda">
                                                    {offer.priceCurrency}
                                                </DetailRow>
                                            )}
                                            {offer.url && (
                                                <DetailRow label="URL da oferta">
                                                    <ExternalLink href={offer.url} />
                                                </DetailRow>
                                            )}
                                            {offer.validFrom && (
                                                <DetailRow label="Válida desde">
                                                    {formatDate(offer.validFrom)}
                                                </DetailRow>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </DetailSection>
                        )}

                        <EntityGroup title="Organizadores" entities={eventOrganizers} />
                        <EntityGroup title="Promotores" entities={eventPromoters} />
                        <EntityGroup title="Participantes" entities={eventPerformers} />
                        <EntityGroup title="Mantenedores" entities={eventMaintainers} />
                        <EntityGroup title="Financiadores" entities={eventFunders} />
                        <EntityGroup title="Atores" entities={eventActors} />
                        <EntityGroup title="Diretores" entities={eventDirectors} />
                        <EntityGroup title="Compositores" entities={eventComposers} />
                        <AudienceGroup audience={eventAudience} />

                        <DetailSection title="Descrição">
                            <p className={`text-base leading-6 text-[var(--text-secondary)] ${isDescriptionExpanded ? '' : 'line-clamp-3'
                                }`}>
                                {event.description}
                            </p>
                            <button
                                type="button"
                                aria-expanded={isDescriptionExpanded}
                                onClick={() => setIsDescriptionExpanded((expanded) => !expanded)}
                                className="self-start text-sm font-semibold text-[var(--primary)] underline"
                            >
                                {isDescriptionExpanded ? 'Ler menos' : 'Ler descrição completa'}
                            </button>
                        </DetailSection>
                    </div>
                ) : (
                    <div className="flex min-h-0 flex-1 items-center justify-center p-3 text-center text-sm text-[var(--text-secondary)]">
                        Selecione um evento para ver os detalhes.
                    </div>
                )}
            </div>

            {event && isImageExpanded && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Imagem ampliada: ${event.title}`}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                    onClick={() => setIsImageExpanded(false)}
                >
                    <div
                        className="relative max-w-6xl translate-y-4"
                        style={{
                            aspectRatio: expandedImageRatio ?? 2,
                            width: `min(90vw, ${(expandedImageRatio ?? 2) * 85}vh, 72rem)`,
                        }}
                        onClick={(clickEvent) => clickEvent.stopPropagation()}
                    >
                        <Image
                            src={event.imageUrl}
                            alt={event.title}
                            fill
                            sizes="90vw"
                            className="object-contain"
                            onLoad={(loadEvent) => {
                                const { naturalWidth, naturalHeight } = loadEvent.currentTarget;

                                if (naturalWidth > 0 && naturalHeight > 0) {
                                    setExpandedImageRatio(naturalWidth / naturalHeight);
                                }
                            }}
                        />
                        <button
                            type="button"
                            aria-label="Fechar imagem ampliada"
                            onClick={() => setIsImageExpanded(false)}
                            className="absolute right-3 top-8 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/80 text-2xl leading-none text-white shadow-md transition-colors hover:bg-black"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
