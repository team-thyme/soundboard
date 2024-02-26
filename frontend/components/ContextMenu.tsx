import {
    flip,
    useClientPoint,
    useDismiss,
    useFloating,
    useInteractions,
    type ElementProps,
    type FloatingContext,
    type Placement,
    FloatingPortal,
} from '@floating-ui/react';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ReactNode, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';

export interface ContextMenuItem {
    icon: IconProp;
    title: string;
    shortcut?: string;
    onClick?: () => void;
}

interface ContextMenuProps {
    children(props: Record<string, unknown>): ReactNode;

    items: ContextMenuItem[];
}

function useContextMenu(context: FloatingContext): ElementProps {
    const { onOpenChange } = context;
    return useMemo(
        () => ({
            reference: {
                onContextMenu: (event) => {
                    event.preventDefault();
                    onOpenChange(true, event.nativeEvent);
                },
            },
        }),
        [onOpenChange],
    );
}

function getTransformOrigin(placement: Placement): string | undefined {
    switch (placement) {
        case 'top-start':
            return 'bottom left';
        case 'top-end':
            return 'bottom right';
        case 'bottom-start':
            return 'top left';
        case 'bottom-end':
            return 'top right';
        default:
            return undefined;
    }
}

export default function ContextMenu(props: ContextMenuProps) {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState<{
        x: number;
        y: number;
    } | null>(null);

    const { refs, floatingStyles, context, placement } = useFloating({
        open,
        onOpenChange: (open, event) => {
            setOpen(open);
            if (event instanceof MouseEvent) {
                setPosition({
                    x: event.clientX,
                    y: event.clientY,
                });
            } else {
                setPosition(null);
            }
        },
        placement: 'bottom-start',
        strategy: 'fixed',
        middleware: [flip()],
    });

    const { getReferenceProps, getFloatingProps } = useInteractions([
        useContextMenu(context),
        useDismiss(context, {
            escapeKey: true,
            referencePress: true,
            outsidePress: true,
            ancestorScroll: true,
        }),
        useClientPoint(context, {
            enabled: position !== null,
            ...position,
        }),
    ]);

    const transformOrigin = getTransformOrigin(placement);

    return (
        <>
            {props.children({
                ref: refs.setReference,
                ...getReferenceProps(),
            })}
            {open && (
                <FloatingPortal id="root">
                    <div
                        ref={refs.setFloating}
                        style={floatingStyles}
                        {...getFloatingProps()}
                    >
                        <Menu
                            style={{ transformOrigin }}
                            items={props.items}
                            closeMenu={() => {
                                setOpen(false);
                            }}
                        />
                    </div>
                </FloatingPortal>
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
