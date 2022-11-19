import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, {
    MouseEvent,
    MouseEventHandler,
    ReactNode,
    useCallback,
    useMemo,
    useState,
} from 'react';
import ReactDOM from 'react-dom';
import { Modifier, usePopper } from 'react-popper';

import useKeydown from '../hooks/useKeydown';

export interface ContextMenuItem {
    icon: IconProp;
    title: string;
    shortcut?: string;
    onClick?: () => void;
}

interface ContextMenuProps {
    children(props: { onContextMenu: MouseEventHandler<any> }): ReactNode;

    items: ContextMenuItem[];
}

const transformOriginModifier: Modifier<'transformOrigin'> = {
    name: 'transformOrigin',
    enabled: true,
    phase: 'beforeWrite',
    requires: ['popperOffsets'],
    fn: ({ state, options }) => {
        const { x: refX, y: refY } = state.rects.reference;
        const { x: popperX, y: popperY } = state.modifiersData.popperOffsets!;

        const offsetX = refX - popperX;
        const offsetY = refY - popperY;

        // @ts-expect-error `inner` is not defined, because we're defining it here
        state.elements.inner = state.elements.popper.firstElementChild;
        state.styles.inner = {
            transformOrigin: `${offsetX}px ${offsetY}px`,
        };
    },
};

export default function ContextMenu(props: ContextMenuProps) {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const onContextMenu = useCallback(
        (e: MouseEvent<any>) => {
            e.preventDefault();
            setOpen((open) => !open);
            setPosition({ x: e.clientX, y: e.clientY });
        },
        [setOpen],
    );

    // Close the context menu when the user presses the Escape key
    useKeydown('Escape', () => setOpen(false), open);

    // Popper
    const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
        null,
    );
    const virtualReference = useMemo(
        () => ({
            getBoundingClientRect() {
                return new DOMRect(position.x, position.y, 0, 0);
            },
        }),
        [position],
    );
    const { styles, attributes } = usePopper(virtualReference, popperElement, {
        placement: 'bottom-start',
        strategy: 'fixed',
        modifiers: [transformOriginModifier],
    });

    return (
        <>
            {props.children({ onContextMenu })}
            {open &&
                ReactDOM.createPortal(
                    <div
                        className="ContextMenuLayer"
                        onClick={() => setOpen(false)}
                    >
                        <div
                            ref={setPopperElement}
                            style={styles.popper}
                            {...attributes.popper}
                        >
                            <Menu
                                style={styles.inner}
                                items={props.items}
                                closeMenu={() => {
                                    setOpen(false);
                                }}
                            />
                        </div>
                    </div>,
                    document.getElementById('root') as HTMLDivElement,
                )}
        </>
    );
}

interface MenuOwnProps {
    items: ContextMenuItem[];
    closeMenu: () => void;
}

type MenuProps = MenuOwnProps &
    Omit<
        React.ComponentPropsWithoutRef<'div'>,
        keyof MenuOwnProps | 'onClick' | 'role' | 'className'
    >;

function Menu({ items, closeMenu, ...otherProps }: MenuProps) {
    return (
        <div
            role="menu"
            className="ContextMenu"
            onClick={(e) => {
                e.stopPropagation();
            }}
            {...otherProps}
        >
            <ul className="ContextMenu__items">
                {items.map((item, index) => (
                    <li key={index} className="ContextMenu__item">
                        <Item
                            {...item}
                            autoFocus={index === 0}
                            onClick={() => {
                                item.onClick?.();
                                closeMenu();
                            }}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}

type ItemProps = ContextMenuItem &
    Omit<React.ComponentPropsWithoutRef<'button'>, keyof ContextMenuItem>;

function Item({ icon, title, shortcut, ...otherProps }: ItemProps) {
    return (
        <button role="menuitem" className="ContextMenuItem" {...otherProps}>
            <span className="ContextMenuItem__icon">
                {<FontAwesomeIcon icon={icon} />}
            </span>
            <span className="ContextMenuItem__title">{title}</span>
            <span className="ContextMenuItem__shortcut">{shortcut}</span>
        </button>
    );
}
