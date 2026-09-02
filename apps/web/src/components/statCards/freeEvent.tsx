'use client';

import { useEffect, useState } from 'react';
import { useMunicipality } from '@/components/backoffice/BackofficeShell';
import { calculatePercentage } from './percentageCounter';


interface EventCountResponse {
    totalCount: number;
}

export function FreeEventCounter() {
    const municipality = useMunicipality();
    const [eventCount, setEventCount] = useState<number | null>(null);
    const [totalCount, setTotalCount] = useState<number | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        async function loadCount() {
            setEventCount(null);
            setTotalCount(null);
            const baseUrl =
                'http://localhost:5000/events/search?Locality=' + encodeURIComponent(municipality);

            const [freeResponse, totalResponse] = await Promise.all([
                fetch(`${baseUrl} &IsAccessibleForFree=true`, {
                    signal: controller.signal,
                }),
                fetch(baseUrl, {
                    signal: controller.signal,
                })
            ])


            if (!freeResponse.ok || !totalResponse.ok) {
                throw new Error(
                    `Failed to fetch event counters`,
                );
            }

            const freeData: EventCountResponse = await freeResponse.json();
            const totalData: EventCountResponse = await totalResponse.json();
            console.log(freeData, totalData);
            setEventCount(freeData.totalCount);
            setTotalCount(totalData.totalCount);
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
        <>
            <h2 className="text-2xl font-semibold">
                {eventCount ?? 'Loading...'}
            </h2>
            <p className="text-sm font-bold text-[var(--text-tertiary)]">
                {eventCount === null || totalCount === null
                    ? '—'
                    : `${calculatePercentage(eventCount, totalCount)} do total`}
            </p>
        </>
    );
}