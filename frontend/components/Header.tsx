import { useContext } from 'react';
import * as React from 'react';
import { SearchContext } from './App';

function SearchBar() {
    const { query, setQuery } = useContext(SearchContext);

    return (
        <div className="SearchBar">
            <input
                className="SearchBar__input"
                type="text"
                value={query}
                placeholder="Cook, Search, Delicious!"
                onChange={(e) => setQuery(e.target.value)}
            />
            <button className="SearchBar__clear" onClick={() => setQuery('')}>
                x
            </button>
        </div>
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
