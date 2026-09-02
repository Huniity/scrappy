

export async function publishEvent(eventId: string) {
    const response = await fetch(
        `http://localhost:5000/events/${eventId}`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
              },
            body: JSON.stringify({
                isPublished: true,
            }),
        },
    );

    if (!response.ok) {
        throw new Error(`Failed to publish event: ${response.status}`);
    }

    return response.json();
}