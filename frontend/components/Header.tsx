import {
    arrow,
    FloatingPortal,
    shift,
    useClick,
    useDismiss,
    useFloating,
    useInteractions,
} from '@floating-ui/react';
import React, { useRef, useState } from 'react';
import config from '../config';

import IconButton, { IconButtonProps } from './IconButton';
import Modal, { ModalLayer } from './Modal';
import { Preferences } from './preferences/Preferences';

interface SearchBarProps {
    query: string;
    onQueryChange(query: string): void;
    playRandomFilteredSample(): void;
}

function SearchBar(props: SearchBarProps) {
    const { query, onQueryChange, playRandomFilteredSample } = props;

    return (
        <div className="SearchBar">
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

interface ModalIconButtonProps extends Omit<IconButtonProps, 'innerRef'> {
    children: React.ReactNode;
}

function ModalIconButton({
    children,
    ...iconButtonProps
}: ModalIconButtonProps) {
    const [open, setOpen] = useState(false);
    const arrowRef = useRef(null);

    const { refs, floatingStyles, context, placement, middlewareData } =
        useFloating({
            open,
            onOpenChange: setOpen,
            middleware: [
                shift({
                    padding: 10,
                }),
                arrow({
                    element: arrowRef,
                }),
            ],
        });

    const { getReferenceProps, getFloatingProps } = useInteractions([
        useClick(context),
        useDismiss(context),
    ]);

    return (
        <>
            <IconButton
                {...iconButtonProps}
                innerRef={refs.setReference}
                {...getReferenceProps()}
            />
            {open && (
                <FloatingPortal id="root">
                    <ModalLayer>
                        <Modal
                            innerRef={refs.setFloating}
                            style={floatingStyles}
                            arrowProps={{
                                ref: arrowRef,
                                style: {
                                    left: middlewareData.arrow?.x,
                                    top: middlewareData.arrow?.y,
                                },
                            }}
                            data-floating-ui-placement={placement}
                            {...getFloatingProps()}
                        >
                            {children}
                        </Modal>
                    </ModalLayer>
                </FloatingPortal>
            )}
        </>
    );
}

interface HeaderProps extends SearchBarProps {}

export default function Header(props: HeaderProps) {
    const { query, onQueryChange, playRandomFilteredSample } = props;

    return (
        <header className="Header">
            <h1 className="Header__title">Soundboard</h1>
            <div className="Header__search">
                <SearchBar
                    query={query}
                    onQueryChange={onQueryChange}
                    playRandomFilteredSample={playRandomFilteredSample}
                />
            </div>
            <div className="Header__buttons">
                <ModalIconButton icon="cog" kind="header" title="Preferences">
                    <Preferences />
                </ModalIconButton>
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
