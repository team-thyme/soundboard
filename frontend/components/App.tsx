import React, { Context, useMemo, useState } from 'react';

import Header from './Header';
import SampleList from './SampleList';

type SearchContextValue = {
    query: string;
    setQuery(query: string): void;
};

export const SearchContext: Context<SearchContextValue> = React.createContext(
    // This will cause errors if no SearchContext.Provider is used, but that
    // should never happen. And I would prefer a hard error over it silently not
    // working any day.
    undefined as any,
);

function useSearchContextValue(): SearchContextValue {
    const [query, setQuery] = useState('');
    return useMemo(() => ({ query, setQuery }), [query, setQuery]);
}

export default function App() {
    const searchContext = useSearchContextValue();

    return (
        <SearchContext.Provider value={searchContext}>
            <Header />
            <SampleList />
        </SearchContext.Provider>
    );
}
