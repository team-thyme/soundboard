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

    return (
        <SearchContext.Provider value={searchContext}>
            <Header />
            <SampleList />
        </SearchContext.Provider>
    );
}
