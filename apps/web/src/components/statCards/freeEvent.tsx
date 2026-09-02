'use client';

import { useEffect, useState } from 'react';
import { useMunicipality } from '@/components/backoffice/BackofficeShell';

interface EventCountResponse {
    totalCount: number;
}

export function FreeEventCounter() {
    const municipality = useMunicipality();
    const [eventCount, setEventCount] = useState<number | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        async function loadCount() {
            setEventCount(null);

            const url =
                'http://localhost:5000/events/search?Locality=' + encodeURIComponent(municipality) + '&IsAccessibleForFree=true';

            const response = await fetch(url, {
                signal: controller.signal,
            });

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch events: ${response.status}`,
                );
            }

            const data: EventCountResponse = await response.json();
            console.log(data);
            setEventCount(data.totalCount);
        }

        loadCount().catch((error: unknown) => {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return;
            }

            console.error(error);
        });

        return () => controller.abort();
    }, [municipality]);

    return (
        <h2 className="text-2xl font-semibold">
            {eventCount ?? 'Loading...'}
        </h2>
    );
}