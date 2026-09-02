

export async function unpublishEvent(eventId: string) {
    const response = await fetch(
        `http://localhost:5000/events/${eventId}`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
              },
            body: JSON.stringify({
                isPublished: false,
            }),
        },
    );

    if (!response.ok) {
        throw new Error(`Failed to unpublish event: ${response.status}`);
    }

    return response.json();
}