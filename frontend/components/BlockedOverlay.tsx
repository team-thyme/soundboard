import { useEffect, useState } from 'react';

import { player } from '../helpers/Player';

export default function BlockedOverlay(): JSX.Element | null {
    const [isBlocked, setBlocked] = useState(false);

    useEffect(() => {
        function handleBlocked() {
            setBlocked(true);
        }

        player.on('blocked', '*', handleBlocked);
        return () => {
            player.off('blocked', '*', handleBlocked);
        }
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
        }
    }, [isBlocked]);

    if (!isBlocked) {
        return null;
    }

    return (
        <div className="BlockedOverlay">AUDIO BLOCKED</div>
    )
}
