import * as React from 'react';
import { useMemo, useState, Context, useEffect } from 'react';
import Header from './Header';
import SampleList from './SampleList';
import { player } from '../helpers/Player';

export const SearchContext: Context<{
    query: string;
    setQuery(query: string): void;
}> = React.createContext(null);

export default function App() {
    // Search context
    const [query, setQuery] = useState('');
    const searchContext = useMemo(() => ({ query, setQuery }), [
        query,
        setQuery,
    ]);

    // Handle keyboard shortcuts
    useEffect(() => {
        function handleKeyDown(e) {
            if (e.target.tagName === 'INPUT') {
                return;
            }

            switch (e.code) {
                case 'Space':
                    player.stopAll();
                    e.preventDefault();
                    break;
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    });

    return (
        <SearchContext.Provider value={searchContext}>
            <Header />
            <SampleList />
        </SearchContext.Provider>
    );
}
