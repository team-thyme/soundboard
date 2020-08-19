import { useContext } from 'react';
import * as React from 'react';
import { SearchContext } from './App';

function SearchBar() {
    const { query, setQuery } = useContext(SearchContext);

    return (
        <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
        />
    );
}

export default function Header() {
    return (
        <>
            <div className="Header">
                <div className="Header__title">Soundboard</div>
                <div className="Header__search">
                    <SearchBar />
                </div>
                <div className="Header__buttons">Buttons</div>
            </div>
            <div className="Header__pusher" />
        </>
    );
}
