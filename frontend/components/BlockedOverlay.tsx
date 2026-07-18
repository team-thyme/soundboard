import { useEffect, useState } from 'react';

import { player } from '../helpers/Player';

export function BlockedOverlay(): JSX.Element | null {
    const [isBlocked, setBlocked] = useState(false);

    useEffect(() => {
        function handleBlocked() {
            setBlocked(true);
        }

        player.addEventListener('blocked', handleBlocked);
        return () => {
            player.removeEventListener('blocked', handleBlocked);
        };
    }, []);

    useEffect(() => {
        if (!isBlocked) {
            return;
        }

        function handleInteraction() {
            setBlocked(false);
            player.playBlockedSamples();
        }

        window.addEventListener('click', handleInteraction);
        window.addEventListener('keypress', handleInteraction);
        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keypress', handleInteraction);
        };
    }, [isBlocked]);

    if (!isBlocked) {
        return null;
    }

    return (
        <div className="BlockedOverlay">
            <div className="BlockedOverlay__content">
                <h1>Autoplay Blocked</h1>
                <p>Click or press any key to continue</p>
            </div>
        </div>
    );
}
