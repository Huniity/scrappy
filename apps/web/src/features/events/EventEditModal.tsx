'use client';

import {
    useEffect,
    useState,
    type FormEvent,
    type ReactNode,
} from 'react';

import styles from './events.module.css';
import type {
    EventEntity,
    EventItem,
    EventUpdateAudience,
    EventUpdateEntity,
    EventUpdateLocation,
    EventUpdateOffer,
    EventUpdatePayload,
    EventUpdateSchedule,
} from './events.types';

type AgentForm = {
    name: string;
    type: string;
    url: string;
    sameAs: string;
    imageUrl: string;
};

type AudienceForm = {
    name: string;
    audienceType: string;
};

type OfferForm = {
    name: string;
    price: string;
    priceCurrency: string;
    availability: string;
    url: string;
    validFrom: string;
};

type ScheduleForm = {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    timeZone: string;
    repeatDays: string;
};

type AgentGroupKey =
    | 'organizer'
    | 'promoter'
    | 'performers'
    | 'maintainer'
    | 'funder'
    | 'actor'
    | 'director'
    | 'composer';

type EventEditForm = {
    title: string;
    description: string;
    alternateName: string;
    startDate: string;
    endDate: string;
    doorTime: string;
    duration: string;
    type: string;
    status: string;
    attendanceMode: string;
    sourceUrl: string;
    imageUrl: string;
    isAccessibleForFree: '' | 'true' | 'false';
    physicalAccessibility: boolean;
    ageRating: string;
    maximumAttendeeCapacity: string;
    isPublished: boolean;
    keywords: string;
    location: {
        name: string;
        streetAddress: string;
        postalCode: string;
        locality: string;
        district: string;
        region: string;
        country: string;
        dicoCode: string;
        url: string;
        sameAs: string;
        latitude: string;
        longitude: string;
    };
    scheduleEnabled: boolean;
    schedule: ScheduleForm;
    organizer: AgentForm[];
    promoter: AgentForm[];
    performers: AgentForm[];
    maintainer: AgentForm[];
    funder: AgentForm[];
    actor: AgentForm[];
    director: AgentForm[];
    composer: AgentForm[];
    audience: AudienceForm[];
    offers: OfferForm[];
};

const inputClassName =
    'w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]';
const textareaClassName = `${inputClassName} min-h-24 resize-y`;
const sectionClassName =
    'flex flex-col gap-3 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-subtle)] p-4';

const eventTypeOptions = [
    ['Concerto', 'Concerto'],
    ['Feira', 'Feira'],
    ['Mercado', 'Mercado'],
    ['FestaPopular', 'Festa Popular'],
    ['Teatro', 'Teatro'],
    ['Festival', 'Festival'],
    ['Exposição', 'Exposição'],
    ['Cinema', 'Cinema'],
    ['Desporto', 'Desporto'],
    ['Gastronomia', 'Gastronomia'],
    ['Workshop', 'Workshop'],
    ['Conferência', 'Conferência'],
    ['Infantil', 'Infantil'],
    ['Business', 'Business'],
    ['Moda', 'Moda'],
    ['Educativo', 'Educativo'],
    ['Património', 'Património'],
    ['Social', 'Social'],
    ['Cultural', 'Cultural'],
    ['Hackaton', 'Hackaton'],
    ['Outro', 'Outro'],
] as const;

const statusOptions = [
    ['Scheduled', 'Programado'],
    ['Cancelled', 'Cancelado'],
    ['Postponed', 'Adiado'],
    ['Rescheduled', 'Reprogramado'],
    ['Completed', 'Completado'],
    ['MovedOnline', 'Online'],
] as const;

const attendanceOptions = [
    ['InPerson', 'Presencial'],
    ['Online', 'Online'],
    ['Hybrid', 'Híbrido'],
] as const;

const agentTypeOptions = [
    ['Person', 'Pessoa'],
    ['Organization', 'Organização'],
    ['Gov', 'Governo'],
    ['Company', 'Empresa'],
    ['MusicGroup', 'Grupo musical'],
    ['PerformingGroup', 'Grupo de performance'],
    ['Other', 'Outro'],
] as const;

const availabilityOptions = [
    ['https://schema.org/InStock', 'Em stock'],
    ['https://schema.org/BackOrder', 'Por encomenda'],
    ['https://schema.org/Discontinued', 'Descontinuado'],
    ['https://schema.org/InStoreOnly', 'Apenas em loja'],
    ['https://schema.org/LimitedAvailability', 'Disponibilidade limitada'],
    ['https://schema.org/MadeToOrder', 'Por pedido'],
    ['https://schema.org/OnlineOnly', 'Apenas online'],
    ['https://schema.org/OutOfStock', 'Esgotado'],
    ['https://schema.org/PreOrder', 'Pré-encomenda'],
    ['https://schema.org/PreSale', 'Pré-venda'],
    ['https://schema.org/SoldOut', 'Vendido'],
] as const;

const agentGroups: { key: AgentGroupKey; label: string }[] = [
    { key: 'organizer', label: 'Organizadores' },
    { key: 'promoter', label: 'Promotores' },
    { key: 'performers', label: 'Participantes' },
    { key: 'maintainer', label: 'Mantenedores' },
    { key: 'funder', label: 'Financiadores' },
    { key: 'actor', label: 'Atores' },
    { key: 'director', label: 'Diretores' },
    { key: 'composer', label: 'Compositores' },
];

function formatDateTimeLocal(value: string | null | undefined) {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value.slice(0, 16);
    }

    const localDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60 * 1000,
    );

    return localDate.toISOString().slice(0, 16);
}

function formatDateTimeForApi(value: string) {
    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

function createAgentForm(agent: EventEntity | undefined): AgentForm {
    return {
        name: agent?.name ?? '',
        type: agent?.type ?? 'Organization',
        url: agent?.url ?? '',
        sameAs: agent?.sameAs ?? '',
        imageUrl: agent?.imageUrl ?? '',
    };
}

function createEditForm(event: EventItem): EventEditForm {
    const schedule = event.schedule;

    return {
        title: event.title,
        description: event.description ?? '',
        alternateName: event.alternateName ?? '',
        startDate: formatDateTimeLocal(event.startDate),
        endDate: formatDateTimeLocal(event.endDate),
        doorTime: formatDateTimeLocal(event.doorTime),
        duration: event.duration ?? '',
        type: event.type || 'Outro',
        status: event.status || 'Scheduled',
        attendanceMode: event.attendanceMode ?? '',
        sourceUrl: event.sourceUrl ?? '',
        imageUrl: event.imageUrl ?? '',
        isAccessibleForFree:
            event.isAccessibleForFree === null ||
            event.isAccessibleForFree === undefined
                ? ''
                : event.isAccessibleForFree
                    ? 'true'
                    : 'false',
        physicalAccessibility: event.physicalAccessibility ?? false,
        ageRating:
            event.ageRating === null || event.ageRating === undefined
                ? ''
                : String(event.ageRating),
        maximumAttendeeCapacity:
            event.maximumAttendeeCapacity === null ||
            event.maximumAttendeeCapacity === undefined
                ? ''
                : String(event.maximumAttendeeCapacity),
        isPublished: event.isPublished === true,
        keywords: event.keywords.join(', '),
        location: {
            name: event.location.name ?? '',
            streetAddress: event.location.streetAddress ?? '',
            postalCode: event.location.postalCode ?? '',
            locality: event.location.locality ?? '',
            district: event.location.district ?? '',
            region: event.location.region ?? '',
            country: event.location.country ?? 'PT',
            dicoCode: event.location.dicoCode ?? '',
            url: event.location.url ?? '',
            sameAs: event.location.sameAs ?? '',
            latitude:
                event.location.latitude === null ||
                event.location.latitude === undefined
                    ? ''
                    : String(event.location.latitude),
            longitude:
                event.location.longitude === null ||
                event.location.longitude === undefined
                    ? ''
                    : String(event.location.longitude),
        },
        scheduleEnabled: Boolean(schedule),
        schedule: {
            startDate: formatDateTimeLocal(schedule?.startDate),
            endDate: formatDateTimeLocal(schedule?.endDate),
            startTime: schedule?.startTime ?? '',
            endTime: schedule?.endTime ?? '',
            timeZone: schedule?.timeZone ?? 'Europe/Lisbon',
            repeatDays: schedule?.repeatDays?.join(', ') ?? '',
        },
        organizer: (event.organizer ?? []).map(createAgentForm),
        promoter: (event.promoter ?? []).map(createAgentForm),
        performers: (event.performers ?? []).map(createAgentForm),
        maintainer: (event.maintainer ?? []).map(createAgentForm),
        funder: (event.funder ?? []).map(createAgentForm),
        actor: (event.actor ?? []).map(createAgentForm),
        director: (event.director ?? []).map(createAgentForm),
        composer: (event.composer ?? []).map(createAgentForm),
        audience: (event.audience ?? []).map((audience) => ({
            name: audience.name ?? '',
            audienceType: audience.audienceType ?? '',
        })),
        offers: (event.offers ?? []).map((offer) => ({
            name: offer.name ?? '',
            price: offer.price === null || offer.price === undefined
                ? '0'
                : String(offer.price),
            priceCurrency: offer.priceCurrency ?? 'EUR',
            availability: offer.availability ?? 'https://schema.org/InStock',
            url: offer.url ?? '',
            validFrom: formatDateTimeLocal(offer.validFrom),
        })),
    };
}

function toBackendEnum(value: string) {
    return value
        .trim()
        .replace(/[()]/g, ' ')
        .split(/[\s-]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toLocaleUpperCase('pt-PT') + part.slice(1))
        .join('');
}

function toBackendRegion(value: string) {
    const normalized = value.trim().toLocaleLowerCase('pt-PT');
    const regionCodes: Record<string, string> = {
        norte: 'PT11',
        centro: 'PT16',
        'grande lisboa': 'PT1A',
        'península de setúbal': 'PT1B',
        'oeste e vale do tejo': 'PT1C',
        alentejo: 'PT18',
        algarve: 'PT15',
        'região autónoma dos açores': 'PT20',
        'região autónoma da madeira': 'PT30',
    };

    return regionCodes[normalized] ?? value.trim();
}

function splitCommaSeparated(value: string) {
    return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}

function optionalNumber(value: string) {
    if (!value.trim()) {
        return undefined;
    }

    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : undefined;
}

function optionalText(value: string) {
    const trimmed = value.trim();

    return trimmed || undefined;
}

function isValidUrl(value: string) {
    try {
        const url = new URL(value);

        return (
            (url.protocol === 'http:' || url.protocol === 'https:') &&
            url.hostname.includes('.')
        );
    } catch {
        return false;
    }
}

function createAgentPayload(agent: AgentForm): EventUpdateEntity {
    return {
        name: agent.name.trim(),
        type: agent.type || 'Organization',
        url: optionalText(agent.url),
        sameAs: optionalText(agent.sameAs),
        imageUrl: optionalText(agent.imageUrl),
    };
}

function createLocationPayload(form: EventEditForm['location']): EventUpdateLocation {
    return {
        name: form.name.trim(),
        streetAddress: optionalText(form.streetAddress),
        postalCode: optionalText(form.postalCode),
        locality: toBackendEnum(form.locality),
        district: toBackendEnum(form.district),
        region: toBackendRegion(form.region),
        country: form.country.trim().toUpperCase(),
        dicoCode: form.dicoCode.trim(),
        url: optionalText(form.url),
        sameAs: optionalText(form.sameAs),
        latitude: form.latitude.trim(),
        longitude: form.longitude.trim(),
    };
}

function createSchedulePayload(form: ScheduleForm): EventUpdateSchedule {
    return {
        startDate: formatDateTimeForApi(form.startDate),
        endDate: form.endDate
            ? formatDateTimeForApi(form.endDate)
            : undefined,
        startTime: optionalText(form.startTime),
        endTime: optionalText(form.endTime),
        timeZone: optionalText(form.timeZone),
        repeatDays: splitCommaSeparated(form.repeatDays),
    };
}

function createOfferPayload(offer: OfferForm): EventUpdateOffer {
    const availability = offer.availability.trim();

    return {
        name: offer.name.trim(),
        price: Number(offer.price),
        priceCurrency: offer.priceCurrency.trim().toUpperCase(),
        availability: availability.startsWith('https://schema.org/')
            ? availability
            : `https://schema.org/${availability}`,
        url: optionalText(offer.url),
        validFrom: offer.validFrom
            ? formatDateTimeForApi(offer.validFrom)
            : undefined,
    };
}

function getAgentRows(form: EventEditForm, group: AgentGroupKey) {
    return form[group].filter((agent) =>
        agent.name.trim() ||
        agent.url.trim() ||
        agent.sameAs.trim() ||
        agent.imageUrl.trim(),
    );
}

function getAudienceRows(form: EventEditForm): EventUpdateAudience[] {
    return form.audience
        .filter((audience) => audience.name.trim() || audience.audienceType.trim())
        .map((audience) => ({
            name: optionalText(audience.name),
            audienceType: optionalText(audience.audienceType),
        }));
}

function validateForm(form: EventEditForm, originalEvent: EventItem) {
    if (form.title.trim().length < 3) {
        return 'O título deve ter pelo menos 3 caracteres.';
    }

    if (
        !form.description.trim() &&
        originalEvent.description.trim()
    ) {
        return 'A descrição não pode ficar vazia.';
    }

    if (
        form.description.trim() &&
        form.description.trim().length < 10
    ) {
        return 'A descrição deve ter pelo menos 10 caracteres.';
    }

    if (!form.startDate) {
        return 'A data de início é obrigatória.';
    }

    if (form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
        return 'A data de fim deve ser posterior à data de início.';
    }

    if (!isValidUrl(form.sourceUrl.trim())) {
        return 'Indica um URL principal válido.';
    }

    const location = form.location;

    if (!location.name.trim() || !location.locality.trim()) {
        return 'O nome do local e a localidade são obrigatórios.';
    }

    if (!location.district.trim() || !location.region.trim()) {
        return 'O distrito e a região são obrigatórios.';
    }

    if (location.country.trim().toUpperCase() !== 'PT') {
        return 'O país da localização deve ser PT.';
    }

    if (!/^\d{4}$/.test(location.dicoCode.trim())) {
        return 'O código DICO deve ter 4 algarismos.';
    }

    const hasLatitude = Boolean(location.latitude.trim());
    const hasLongitude = Boolean(location.longitude.trim());

    if (!hasLatitude || !hasLongitude) {
        return 'A latitude e a longitude são obrigatórias para editar a localização.';
    }

    const latitude = Number(location.latitude);
    const longitude = Number(location.longitude);

    if (
        !Number.isFinite(latitude) ||
        latitude < -90 ||
        latitude > 90 ||
        !Number.isFinite(longitude) ||
        longitude < -180 ||
        longitude > 180
    ) {
        return 'Indica coordenadas válidas.';
    }

    for (const group of agentGroups) {
        const invalidAgent = getAgentRows(form, group.key).find(
            (agent) => !agent.name.trim(),
        );

        if (invalidAgent) {
            return `Preenche o nome de todos os ${group.label.toLocaleLowerCase('pt-PT')}.`;
        }
    }

    const offersToValidate = form.offers.filter(
        (offer) =>
            offer.name.trim() ||
            offer.price.trim() ||
            offer.url.trim() ||
            offer.validFrom.trim(),
    );

    for (const invalidOffer of offersToValidate) {
        if (!invalidOffer.name.trim()) {
            return 'Cada oferta deve ter um nome.';
        }

        if (!invalidOffer.price.trim() || Number(invalidOffer.price) < 0) {
            return 'Cada oferta deve ter um preço válido.';
        }

        if (invalidOffer.priceCurrency.trim().length !== 3) {
            return 'A moeda de cada oferta deve ter 3 letras.';
        }

        if (!invalidOffer.availability.trim()) {
            return 'Indica a disponibilidade de cada oferta.';
        }

        if (invalidOffer.url.trim() && !isValidUrl(invalidOffer.url.trim())) {
            return 'Indica URLs válidos nas ofertas.';
        }
    }

    if (form.scheduleEnabled && !form.schedule.startDate) {
        return 'A data inicial do horário recorrente é obrigatória.';
    }

    return null;
}

function createPayload(form: EventEditForm): EventUpdatePayload {
    const payload: EventUpdatePayload = {
        title: form.title.trim(),
        description: optionalText(form.description),
        alternateName: form.alternateName.trim(),
        startDate: formatDateTimeForApi(form.startDate),
        endDate: form.endDate
            ? formatDateTimeForApi(form.endDate)
            : undefined,
        doorTime: form.doorTime
            ? formatDateTimeForApi(form.doorTime)
            : undefined,
        duration: optionalText(form.duration),
        type: form.type || undefined,
        location: createLocationPayload(form.location),
        sourceUrl: form.sourceUrl.trim(),
        imageUrl: optionalText(form.imageUrl),
        isAccessibleForFree:
            form.isAccessibleForFree === ''
                ? undefined
                : form.isAccessibleForFree === 'true',
        physicalAccessibility: form.physicalAccessibility,
        ageRating: optionalNumber(form.ageRating),
        maximumAttendeeCapacity: optionalNumber(
            form.maximumAttendeeCapacity,
        ),
        keywords: splitCommaSeparated(form.keywords),
        organizer: getAgentRows(form, 'organizer').map(createAgentPayload),
        promoter: getAgentRows(form, 'promoter').map(createAgentPayload),
        performers: getAgentRows(form, 'performers').map(createAgentPayload),
        maintainer: getAgentRows(form, 'maintainer').map(createAgentPayload),
        funder: getAgentRows(form, 'funder').map(createAgentPayload),
        actor: getAgentRows(form, 'actor').map(createAgentPayload),
        director: getAgentRows(form, 'director').map(createAgentPayload),
        composer: getAgentRows(form, 'composer').map(createAgentPayload),
        audience: getAudienceRows(form),
        eventAttendanceMode: form.attendanceMode || undefined,
        schedule: form.scheduleEnabled
            ? createSchedulePayload(form.schedule)
            : undefined,
        offers: form.offers
            .filter((offer) =>
                offer.name.trim() ||
                offer.price.trim() ||
                offer.url.trim() ||
                offer.validFrom.trim(),
            )
            .map(createOfferPayload),
        eventStatus: form.status || undefined,
        isPublished: form.isPublished,
    };

    return payload;
}

function Field({
    label,
    required = false,
    hint,
    children,
    className = '',
}: {
    label: string;
    required?: boolean;
    hint?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <label className={`flex flex-col gap-1 ${className}`}>
            <span className="text-xs font-semibold text-[var(--text-primary)]">
                {label}
                {required && <span className="ml-1 text-[var(--danger)]">*</span>}
            </span>
            {children}
            {hint && (
                <span className="text-[11px] leading-4 text-[var(--text-tertiary)]">
                    {hint}
                </span>
            )}
        </label>
    );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className={sectionClassName}>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">{title}</h3>
            {children}
        </section>
    );
}

function EmptyRowButton({ onClick, label }: { onClick: () => void; label: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="self-start rounded-md border border-dashed border-[var(--primary-border)] px-3 py-1.5 text-xs font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--primary-soft)]"
        >
            + {label}
        </button>
    );
}

function RemoveRowButton({ onClick, label }: { onClick: () => void; label: string }) {
    return (
        <button
            type="button"
            aria-label={label}
            onClick={onClick}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-lg leading-none text-[var(--text-secondary)] transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
        >
            ×
        </button>
    );
}

export function EventEditModal({
    event,
    onClose,
    onSave,
}: {
    event: EventItem;
    onClose: () => void;
    onSave: (payload: EventUpdatePayload) => Promise<void>;
}) {
    const [form, setForm] = useState<EventEditForm>(() => createEditForm(event));
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const handleEscape = (keyboardEvent: KeyboardEvent) => {
            if (keyboardEvent.key === 'Escape' && !isSaving) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = previousOverflow;
        };
    }, [isSaving, onClose]);

    function updateField<Key extends keyof EventEditForm>(
        key: Key,
        value: EventEditForm[Key],
    ) {
        setForm((current) => ({ ...current, [key]: value }));
    }

    function updateLocation(
        key: keyof EventEditForm['location'],
        value: string,
    ) {
        setForm((current) => ({
            ...current,
            location: { ...current.location, [key]: value },
        }));
    }

    function updateSchedule(key: keyof ScheduleForm, value: string) {
        setForm((current) => ({
            ...current,
            schedule: { ...current.schedule, [key]: value },
        }));
    }

    function updateAgent(
        group: AgentGroupKey,
        index: number,
        key: keyof AgentForm,
        value: string,
    ) {
        setForm((current) => ({
            ...current,
            [group]: current[group].map((agent, agentIndex) =>
                agentIndex === index ? { ...agent, [key]: value } : agent,
            ),
        }));
    }

    function addAgent(group: AgentGroupKey) {
        setForm((current) => ({
            ...current,
            [group]: [...current[group], createAgentForm(undefined)],
        }));
    }

    function removeAgent(group: AgentGroupKey, index: number) {
        setForm((current) => ({
            ...current,
            [group]: current[group].filter((_, agentIndex) => agentIndex !== index),
        }));
    }

    function updateAudience(index: number, key: keyof AudienceForm, value: string) {
        setForm((current) => ({
            ...current,
            audience: current.audience.map((audience, audienceIndex) =>
                audienceIndex === index
                    ? { ...audience, [key]: value }
                    : audience,
            ),
        }));
    }

    function updateOffer(index: number, key: keyof OfferForm, value: string) {
        setForm((current) => ({
            ...current,
            offers: current.offers.map((offer, offerIndex) =>
                offerIndex === index ? { ...offer, [key]: value } : offer,
            ),
        }));
    }

    async function handleSubmit(submitEvent: FormEvent<HTMLFormElement>) {
        submitEvent.preventDefault();
        const validationError = validateForm(form, event);

        if (validationError) {
            setError(validationError);
            return;
        }

        setError(null);
        setIsSaving(true);

        try {
            await onSave(createPayload(form));
        } catch (saveError) {
            setError(
                saveError instanceof Error
                    ? saveError.message
                    : 'Não foi possível guardar as alterações.',
            );
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-event-title"
            className={styles.eventEditOverlay}
            onClick={() => {
                if (!isSaving) {
                    onClose();
                }
            }}
        >
            <div
                className={styles.eventEditDialog}
                onClick={(clickEvent) => clickEvent.stopPropagation()}
            >
                <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--border-strong)] px-5 py-4">
                    <div>
                        <h2 id="edit-event-title" className="text-lg font-bold text-[var(--text-primary)]">
                            Editar evento
                        </h2>
                        <p className="text-xs text-[var(--text-secondary)]">
                            Altera os campos necessários e guarda no final.
                        </p>
                    </div>
                    <button
                        type="button"
                        aria-label="Fechar edição"
                        disabled={isSaving}
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-md text-xl leading-none text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
                        {error && (
                            <div
                                role="alert"
                                className="rounded-md border border-[var(--danger-border)] bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
                            >
                                {error}
                            </div>
                        )}

                        <Section title="Informação principal">
                            <div className="grid gap-3 md:grid-cols-2">
                                <Field label="Título" required className="md:col-span-2">
                                    <input
                                        className={inputClassName}
                                        value={form.title}
                                        onChange={(changeEvent) => updateField('title', changeEvent.target.value)}
                                    />
                                </Field>
                                <Field label="Nome alternativo">
                                    <input
                                        className={inputClassName}
                                        value={form.alternateName}
                                        onChange={(changeEvent) => updateField('alternateName', changeEvent.target.value)}
                                    />
                                </Field>
                                <Field label="Tipo">
                                    <select
                                        className={inputClassName}
                                        value={form.type}
                                        onChange={(changeEvent) => updateField('type', changeEvent.target.value)}
                                    >
                                        {eventTypeOptions.map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Estado">
                                    <select
                                        className={inputClassName}
                                        value={form.status}
                                        onChange={(changeEvent) => updateField('status', changeEvent.target.value)}
                                    >
                                        {statusOptions.map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Modo de participação">
                                    <select
                                        className={inputClassName}
                                        value={form.attendanceMode}
                                        onChange={(changeEvent) => updateField('attendanceMode', changeEvent.target.value)}
                                    >
                                        <option value="">Não definido</option>
                                        {attendanceOptions.map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Descrição" className="md:col-span-2" hint="Mínimo de 10 caracteres quando preenchida.">
                                    <textarea
                                        className={textareaClassName}
                                        value={form.description}
                                        onChange={(changeEvent) => updateField('description', changeEvent.target.value)}
                                    />
                                </Field>
                            </div>
                        </Section>

                        <Section title="Datas e publicação">
                            <div className="grid gap-3 md:grid-cols-2">
                                <Field label="Data de início" required>
                                    <input
                                        type="datetime-local"
                                        className={inputClassName}
                                        value={form.startDate}
                                        onChange={(changeEvent) => updateField('startDate', changeEvent.target.value)}
                                    />
                                </Field>
                                <Field label="Data de fim">
                                    <input
                                        type="datetime-local"
                                        className={inputClassName}
                                        value={form.endDate}
                                        onChange={(changeEvent) => updateField('endDate', changeEvent.target.value)}
                                    />
                                </Field>
                                <Field label="Hora de abertura">
                                    <input
                                        type="datetime-local"
                                        className={inputClassName}
                                        value={form.doorTime}
                                        onChange={(changeEvent) => updateField('doorTime', changeEvent.target.value)}
                                    />
                                </Field>
                                <Field label="Duração" hint="Formato ISO 8601, por exemplo PT2H30M.">
                                    <input
                                        className={inputClassName}
                                        value={form.duration}
                                        onChange={(changeEvent) => updateField('duration', changeEvent.target.value)}
                                    />
                                </Field>
                                <Field label="Publicado">
                                    <label className="flex min-h-10 items-center gap-2 rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)]">
                                        <input
                                            type="checkbox"
                                            checked={form.isPublished}
                                            onChange={(changeEvent) => updateField('isPublished', changeEvent.target.checked)}
                                            className="h-4 w-4 accent-[var(--primary)]"
                                        />
                                        Evento publicado
                                    </label>
                                </Field>
                                <Field label="Entrada gratuita">
                                    <select
                                        className={inputClassName}
                                        value={form.isAccessibleForFree}
                                        onChange={(changeEvent) => updateField('isAccessibleForFree', changeEvent.target.value as EventEditForm['isAccessibleForFree'])}
                                    >
                                        <option value="">Não definido</option>
                                        <option value="true">Sim</option>
                                        <option value="false">Não</option>
                                    </select>
                                </Field>
                                <Field label="Acessibilidade física">
                                    <label className="flex min-h-10 items-center gap-2 rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)]">
                                        <input
                                            type="checkbox"
                                            checked={form.physicalAccessibility}
                                            onChange={(changeEvent) => updateField('physicalAccessibility', changeEvent.target.checked)}
                                            className="h-4 w-4 accent-[var(--primary)]"
                                        />
                                        Local acessível
                                    </label>
                                </Field>
                                <Field label="Classificação etária">
                                    <input
                                        type="number"
                                        min="0"
                                        className={inputClassName}
                                        value={form.ageRating}
                                        onChange={(changeEvent) => updateField('ageRating', changeEvent.target.value)}
                                    />
                                </Field>
                                <Field label="Lotação máxima">
                                    <input
                                        type="number"
                                        min="0"
                                        className={inputClassName}
                                        value={form.maximumAttendeeCapacity}
                                        onChange={(changeEvent) => updateField('maximumAttendeeCapacity', changeEvent.target.value)}
                                    />
                                </Field>
                            </div>
                        </Section>

                        <Section title="Localização">
                            <div className="grid gap-3 md:grid-cols-2">
                                <Field label="Nome do local" required className="md:col-span-2">
                                    <input className={inputClassName} value={form.location.name} onChange={(changeEvent) => updateLocation('name', changeEvent.target.value)} />
                                </Field>
                                <Field label="Rua">
                                    <input className={inputClassName} value={form.location.streetAddress} onChange={(changeEvent) => updateLocation('streetAddress', changeEvent.target.value)} />
                                </Field>
                                <Field label="Código postal">
                                    <input className={inputClassName} value={form.location.postalCode} onChange={(changeEvent) => updateLocation('postalCode', changeEvent.target.value)} />
                                </Field>
                                <Field label="Localidade" required hint="O nome é convertido para o formato de enum usado pela API.">
                                    <input className={inputClassName} value={form.location.locality} onChange={(changeEvent) => updateLocation('locality', changeEvent.target.value)} />
                                </Field>
                                <Field label="Distrito" required>
                                    <input className={inputClassName} value={form.location.district} onChange={(changeEvent) => updateLocation('district', changeEvent.target.value)} />
                                </Field>
                                <Field label="Região" required hint="Aceita o código, por exemplo PT16, ou o nome da região.">
                                    <input className={inputClassName} value={form.location.region} onChange={(changeEvent) => updateLocation('region', changeEvent.target.value)} />
                                </Field>
                                <Field label="País" required>
                                    <input className={inputClassName} value={form.location.country} onChange={(changeEvent) => updateLocation('country', changeEvent.target.value)} />
                                </Field>
                                <Field label="Código DICO" required>
                                    <input className={inputClassName} value={form.location.dicoCode} onChange={(changeEvent) => updateLocation('dicoCode', changeEvent.target.value)} />
                                </Field>
                                <Field label="Latitude" required>
                                    <input type="number" step="any" className={inputClassName} value={form.location.latitude} onChange={(changeEvent) => updateLocation('latitude', changeEvent.target.value)} />
                                </Field>
                                <Field label="Longitude" required>
                                    <input type="number" step="any" className={inputClassName} value={form.location.longitude} onChange={(changeEvent) => updateLocation('longitude', changeEvent.target.value)} />
                                </Field>
                                <Field label="URL do local">
                                    <input type="url" className={inputClassName} value={form.location.url} onChange={(changeEvent) => updateLocation('url', changeEvent.target.value)} />
                                </Field>
                                <Field label="Referência do local">
                                    <input type="url" className={inputClassName} value={form.location.sameAs} onChange={(changeEvent) => updateLocation('sameAs', changeEvent.target.value)} />
                                </Field>
                            </div>
                        </Section>

                        <Section title="Fontes e palavras-chave">
                            <div className="grid gap-3 md:grid-cols-2">
                                <Field label="URL principal" required className="md:col-span-2">
                                    <input type="url" className={inputClassName} value={form.sourceUrl} onChange={(changeEvent) => updateField('sourceUrl', changeEvent.target.value)} />
                                </Field>
                                <Field label="Imagem">
                                    <input type="url" className={inputClassName} value={form.imageUrl} onChange={(changeEvent) => updateField('imageUrl', changeEvent.target.value)} />
                                </Field>
                                <Field label="Palavras-chave" hint="Separa as palavras por vírgulas.">
                                    <input className={inputClassName} value={form.keywords} onChange={(changeEvent) => updateField('keywords', changeEvent.target.value)} />
                                </Field>
                            </div>
                        </Section>

                        <Section title="Horário recorrente">
                            <label className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                                <input
                                    type="checkbox"
                                    checked={form.scheduleEnabled}
                                    onChange={(changeEvent) => updateField('scheduleEnabled', changeEvent.target.checked)}
                                    className="h-4 w-4 accent-[var(--primary)]"
                                />
                                Editar horário recorrente
                            </label>
                            {form.scheduleEnabled && (
                                <div className="grid gap-3 md:grid-cols-2">
                                    <Field label="Início do horário" required>
                                        <input type="datetime-local" className={inputClassName} value={form.schedule.startDate} onChange={(changeEvent) => updateSchedule('startDate', changeEvent.target.value)} />
                                    </Field>
                                    <Field label="Fim do horário">
                                        <input type="datetime-local" className={inputClassName} value={form.schedule.endDate} onChange={(changeEvent) => updateSchedule('endDate', changeEvent.target.value)} />
                                    </Field>
                                    <Field label="Hora inicial">
                                        <input type="time" className={inputClassName} value={form.schedule.startTime} onChange={(changeEvent) => updateSchedule('startTime', changeEvent.target.value)} />
                                    </Field>
                                    <Field label="Hora final">
                                        <input type="time" className={inputClassName} value={form.schedule.endTime} onChange={(changeEvent) => updateSchedule('endTime', changeEvent.target.value)} />
                                    </Field>
                                    <Field label="Fuso horário">
                                        <input className={inputClassName} value={form.schedule.timeZone} onChange={(changeEvent) => updateSchedule('timeZone', changeEvent.target.value)} />
                                    </Field>
                                    <Field label="Dias de repetição" hint="Usa os nomes em inglês separados por vírgulas, por exemplo Monday, Friday.">
                                        <input className={inputClassName} value={form.schedule.repeatDays} onChange={(changeEvent) => updateSchedule('repeatDays', changeEvent.target.value)} />
                                    </Field>
                                </div>
                            )}
                            {!form.scheduleEnabled && (
                                <p className="text-xs text-[var(--text-secondary)]">
                                    Este evento não será alterado nesta secção.
                                </p>
                            )}
                        </Section>

                        {agentGroups.map(({ key, label }) => (
                            <Section key={key} title={label}>
                                {form[key].map((agent, index) => (
                                    <div key={`${key}-${index}`} className="rounded-md border border-[var(--border-strong)] bg-[var(--surface)] p-3">
                                        <div className="flex items-start gap-2">
                                            <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-2">
                                                <Field label="Nome" required>
                                                    <input className={inputClassName} value={agent.name} onChange={(changeEvent) => updateAgent(key, index, 'name', changeEvent.target.value)} />
                                                </Field>
                                                <Field label="Tipo">
                                                    <select className={inputClassName} value={agent.type} onChange={(changeEvent) => updateAgent(key, index, 'type', changeEvent.target.value)}>
                                                        {agentTypeOptions.map(([value, optionLabel]) => (
                                                            <option key={value} value={value}>{optionLabel}</option>
                                                        ))}
                                                    </select>
                                                </Field>
                                                <Field label="URL">
                                                    <input type="url" className={inputClassName} value={agent.url} onChange={(changeEvent) => updateAgent(key, index, 'url', changeEvent.target.value)} />
                                                </Field>
                                                <Field label="Referência">
                                                    <input type="url" className={inputClassName} value={agent.sameAs} onChange={(changeEvent) => updateAgent(key, index, 'sameAs', changeEvent.target.value)} />
                                                </Field>
                                                <Field label="Imagem" className="md:col-span-2">
                                                    <input type="url" className={inputClassName} value={agent.imageUrl} onChange={(changeEvent) => updateAgent(key, index, 'imageUrl', changeEvent.target.value)} />
                                                </Field>
                                            </div>
                                            <RemoveRowButton onClick={() => removeAgent(key, index)} label={`Remover ${label.toLocaleLowerCase('pt-PT').slice(0, -1)}`} />
                                        </div>
                                    </div>
                                ))}
                                <EmptyRowButton onClick={() => addAgent(key)} label={`Adicionar ${label.toLocaleLowerCase('pt-PT').slice(0, -1)}`} />
                            </Section>
                        ))}

                        <Section title="Público-alvo">
                            {form.audience.map((audience, index) => (
                                <div key={`audience-${index}`} className="flex items-end gap-2 rounded-md border border-[var(--border-strong)] bg-[var(--surface)] p-3">
                                    <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-2">
                                        <Field label="Nome">
                                            <input className={inputClassName} value={audience.name} onChange={(changeEvent) => updateAudience(index, 'name', changeEvent.target.value)} />
                                        </Field>
                                        <Field label="Tipo de público">
                                            <input className={inputClassName} value={audience.audienceType} onChange={(changeEvent) => updateAudience(index, 'audienceType', changeEvent.target.value)} />
                                        </Field>
                                    </div>
                                    <RemoveRowButton onClick={() => setForm((current) => ({ ...current, audience: current.audience.filter((_, audienceIndex) => audienceIndex !== index) }))} label="Remover público-alvo" />
                                </div>
                            ))}
                            <EmptyRowButton onClick={() => setForm((current) => ({ ...current, audience: [...current.audience, { name: '', audienceType: '' }] }))} label="Adicionar público-alvo" />
                        </Section>

                        <Section title="Ofertas">
                            {form.offers.map((offer, index) => (
                                <div key={`offer-${index}`} className="rounded-md border border-[var(--border-strong)] bg-[var(--surface)] p-3">
                                    <div className="flex items-start gap-2">
                                        <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-2">
                                            <Field label="Nome">
                                                <input className={inputClassName} value={offer.name} onChange={(changeEvent) => updateOffer(index, 'name', changeEvent.target.value)} />
                                            </Field>
                                            <Field label="Preço">
                                                <input type="number" min="0" step="0.01" className={inputClassName} value={offer.price} onChange={(changeEvent) => updateOffer(index, 'price', changeEvent.target.value)} />
                                            </Field>
                                            <Field label="Moeda">
                                                <input maxLength={3} className={inputClassName} value={offer.priceCurrency} onChange={(changeEvent) => updateOffer(index, 'priceCurrency', changeEvent.target.value)} />
                                            </Field>
                                            <Field label="Disponibilidade">
                                                <select className={inputClassName} value={offer.availability} onChange={(changeEvent) => updateOffer(index, 'availability', changeEvent.target.value)}>
                                                    {availabilityOptions.map(([value, label]) => (
                                                        <option key={value} value={value}>{label}</option>
                                                    ))}
                                                </select>
                                            </Field>
                                            <Field label="URL">
                                                <input type="url" className={inputClassName} value={offer.url} onChange={(changeEvent) => updateOffer(index, 'url', changeEvent.target.value)} />
                                            </Field>
                                            <Field label="Válida desde">
                                                <input type="datetime-local" className={inputClassName} value={offer.validFrom} onChange={(changeEvent) => updateOffer(index, 'validFrom', changeEvent.target.value)} />
                                            </Field>
                                        </div>
                                        <RemoveRowButton onClick={() => setForm((current) => ({ ...current, offers: current.offers.filter((_, offerIndex) => offerIndex !== index) }))} label="Remover oferta" />
                                    </div>
                                </div>
                            ))}
                            <EmptyRowButton onClick={() => setForm((current) => ({ ...current, offers: [...current.offers, { name: '', price: '0', priceCurrency: 'EUR', availability: 'https://schema.org/InStock', url: '', validFrom: '' }] }))} label="Adicionar oferta" />
                        </Section>
                    </div>

                    <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[var(--border-strong)] bg-[var(--surface)] px-5 py-3">
                        <button
                            type="button"
                            disabled={isSaving}
                            onClick={onClose}
                            className="rounded-md border border-[var(--border-strong)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="rounded-md border border-[var(--primary)] bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSaving ? 'A guardar…' : 'Guardar alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
