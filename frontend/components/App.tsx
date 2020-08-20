import * as React from 'react';
import { useMemo, useState } from 'react';
import Header from './Header';
import SampleList from './SampleList';

export const SearchContext = React.createContext({
    query: '',
    setQuery: (_query: string) => {},
});

export default function App() {
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
