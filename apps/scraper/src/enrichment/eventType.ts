import { type NormalizedEvent } from "../types/events";


export type ApiEventType =
    | "Concerto"
    | "Feira"
    | "Mercado"
    | "FestaPopular"
    | "Teatro"
    | "Festival"
    | "Exposição"
    | "Cinema"
    | "Desporto"
    | "Gastronomia"
    | "Workshop"
    | "Conferência"
    | "Infantil"
    | "Business"
    | "Moda"
    | "Educativo"
    | "Património"
    | "Social"
    | "Cultural"
    | "Hackaton"
    | "Outro";


export function classifyEventType(
    event: NormalizedEvent
): ApiEventType {
    const title = event.title.toLowerCase();

    const text = `${event.title} ${event.description ?? ""}`
        .toLowerCase();

    if (event.type === "MusicEvent") {
        return "Concerto";
    }

    if (event.type === "ExhibitionEvent") {
        return "Exposição";
    }

    if (title.includes("festival")) {
        return "Festival";
    }

    if (event.type === "Festival") {
        if (
            text.includes("exposição") ||
            text.includes("exhibition")
        ) {
            return "Exposição";
        }

        return "Festival";
    }

    if (
        title.includes("exposição") ||
        title.includes("exhibition")
    ) {
        return "Exposição";
    }

    if (title.includes("workshop")) {
        return "Workshop";
    }

    if (
        title.includes("concerto") ||
        title.includes("recital")
    ) {
        return "Concerto";
    }

    if (
        text.includes("infantil") ||
        text.includes("crianças") ||
        text.includes("famílias") ||
        text.includes("hora do conto") ||
        text.includes("1º ciclo")
    ) {
        return "Infantil";
    }

    if (
        text.includes("conferência") ||
        text.includes("talk") ||
        text.includes("palestra")
    ) {
        return "Conferência";
    }

    if (
        text.includes("teatro") ||
        text.includes("musical") ||
        text.includes("ópera")
    ) {
        return "Teatro";
    }

    if (text.includes("festival")) {
        return "Festival";
    }

    return "Outro";
}

