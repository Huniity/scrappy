import {
    BackofficeShell,
} from '@/components/backoffice/BackofficeShell';

import {
    EventsWorkspace,
} from '@/features/events/EventsWorkspace';


export default function Home() {
    return (
        <BackofficeShell>
            <EventsWorkspace />
        </BackofficeShell>
    );
}
