import React, { Context, useMemo, useState } from 'react';

import Header from './Header';
import SampleList from './SampleList';

export const SearchContext: Context<{
    query: string;
    setQuery(query: string): void;
}> = React.createContext(
    // This will cause errors if no SearchContext.Provider is used, but that
    // should never happen. And I would prefer a hard error over it silently not
    // working any day.
    undefined as any,
);

export default function App() {
    // Search context
    const [query, setQuery] = useState('');
    const searchContext = useMemo(
        () => ({ query, setQuery }),
        [query, setQuery],
    );

    return (
        <SearchContext.Provider value={searchContext}>
            <Header />
            <SampleList />
        </SearchContext.Provider>
    );
}
