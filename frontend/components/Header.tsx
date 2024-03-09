import { useContext } from 'react';

import { config } from '../config';
import { IconButton } from './IconButton';
import { Modal, ModalContent, ModalTrigger } from './floating/Modal';
import { PlayerContext } from './PlayerContext';
import { Preferences } from './preferences/Preferences';

interface SearchBarProps {
    query: string;
    onQueryChange(query: string): void;
}

function SearchBar(props: SearchBarProps) {
    const { query, onQueryChange } = props;
    const { playRandomFilteredSample } = useContext(PlayerContext)!;

    return (
        <div className="SearchBar" role="search" aria-label="Search samples">
            <input
                name="query"
                className="SearchBar__input"
                type="search"
                value={query}
                placeholder="Cook, Search, Delicious!"
                onChange={(e) => onQueryChange(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                        onQueryChange('');
                    }
                    if (e.key === 'Enter') {
                        playRandomFilteredSample();
                    }
                }}
            />
            {query && (
                <div className="SearchBar__clear">
                    <IconButton
                        onClick={() => onQueryChange('')}
                        kind="search"
                        icon="times"
                        title="Clear input"
                    />
                </div>
            )}
        </div>
    );
}

interface HeaderProps extends SearchBarProps {}

export function Header(props: HeaderProps) {
    const { query, onQueryChange } = props;

    return (
        <header className="Header">
            <h1 className="Header__title">Soundboard</h1>
            <div className="Header__search">
                <SearchBar query={query} onQueryChange={onQueryChange} />
            </div>
            <div className="Header__buttons" role="menubar">
                <Modal>
                    <ModalTrigger>
                        <IconButton
                            icon="cog"
                            kind="header"
                            title="Preferences"
                        />
                    </ModalTrigger>
                    <ModalContent>
                        <Preferences />
                    </ModalContent>
                </Modal>
                <IconButton
                    icon="plus-square"
                    kind="header"
                    title="Request a sample"
                    onClick={() => {
                        window.open(config.contributeUrl, '_blank');
                    }}
                />
            </div>
        </header>
    );
}
