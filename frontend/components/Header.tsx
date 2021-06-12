import React, { useContext } from 'react';

import { SearchContext } from './App';
import IconButton from './IconButton';

function SearchBar() {
    const { query, setQuery } = useContext(SearchContext);

    return (
        <div className="SearchBar">
            <input
                name="query"
                className="SearchBar__input"
                type="search"
                value={query}
                placeholder="Cook, Search, Delicious!"
                onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
                <div className="SearchBar__clear">
                    <IconButton
                        onClick={() => setQuery('')}
                        kind="search"
                        icon="times"
                        title="Clear input"
                    />
                </div>
            )}
        </div>
    );
}

export default function Header() {
    return (
        <>
            <header className="Header">
                <h1 className="Header__title">Soundboard</h1>
                <div className="Header__search">
                    <SearchBar />
                </div>
                <div className="Header__buttons">
                    <IconButton
                        icon="palette"
                        kind="header"
                        title="Change theme"
                    />
                    <IconButton
                        icon="volume-up"
                        kind="header"
                        title="Change volume"
                    />
                    <IconButton
                        icon="plus-square"
                        kind="header"
                        title="Request a sample"
                    />
                </div>
            </header>
            <div className="Header__pusher" />
        </>
    );
}
