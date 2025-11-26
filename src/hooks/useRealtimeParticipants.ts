import { useEffect, useState, useRef } from 'react';

interface Participant {
    unique: string;
    name: string;
    email: string;
    present: boolean;
    seminar_kit: boolean;
    consumption: boolean;
    registered_at?: string;
}

export function useRealtimeParticipants() {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        // Create EventSource connection
        const eventSource = new EventSource('/api/participants/stream');
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
            console.log('SSE Connection established');
            setIsConnected(true);
            setError(null);
        };

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.error) {
                    setError(data.error);
                    return;
                }

                setParticipants(data);
            } catch (err) {
                console.error('Error parsing SSE data:', err);
                setError('Failed to parse data');
            }
        };

        eventSource.onerror = (err) => {
            console.error('SSE Error:', err);
            setIsConnected(false);
            setError('Connection error');

            // EventSource will automatically try to reconnect
        };

        // Cleanup on unmount
        return () => {
            eventSource.close();
            eventSourceRef.current = null;
        };
    }, []);

    const refreshManually = async () => {
        try {
            const response = await fetch('/api/participants');
            const data = await response.json();
            setParticipants(data);
        } catch (err) {
            console.error('Manual refresh error:', err);
        }
    };

    return {
        participants,
        isConnected,
        error,
        refreshManually,
    };
}
