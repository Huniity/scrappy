import {
    type CreateEventPayload,
} from '../mappers/backendEvent';

export type CreateEventResult = {
    success: boolean;
    duplicate: boolean;
    status: number;
    body: string;
};

export async function createEvent(
    payload: CreateEventPayload
): Promise<CreateEventResult> {
    const response = await fetch(
        'http://localhost:5000/events',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }
    );

    const body = await response.text();

    const duplicate =
        response.status === 400 &&
        body.includes(
            'An event with the same district, title, and start date already exists.'
        );

    return {
        success: response.ok,
        duplicate,
        status: response.status,
        body,
    };
}