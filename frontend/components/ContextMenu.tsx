import {
    type ElementProps,
    flip,
    type FloatingContext,
    FloatingPortal,
    type Placement,
    useClientPoint,
    useDismiss,
    useFloating,
    useInteractions,
} from '@floating-ui/react';
import React, {
    createContext,
    Dispatch,
    isValidElement,
    type ReactNode,
    SetStateAction,
    useContext,
    useMemo,
    useState,
} from 'react';
import { Menu } from './menu/Menu';
import { MenuItem, MenuItemProps } from './menu/MenuItem';

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

type ContextMenuContextValue = {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    transformOrigin: string | undefined;
} & Pick<
    ReturnType<typeof useFloating>,
    'floatingStyles' | 'placement' | 'refs'
> &
    Pick<
        ReturnType<typeof useInteractions>,
        'getReferenceProps' | 'getFloatingProps'
    >;
const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);

interface ContextMenuProps {
    children: ReactNode;
}

export function ContextMenu(props: ContextMenuProps) {
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

    const contextValue = useMemo(
        () => ({
            open,
            setOpen,
            floatingStyles,
            placement,
            refs,
            getReferenceProps,
            getFloatingProps,
            transformOrigin,
        }),
        [
            open,
            setOpen,
            floatingStyles,
            placement,
            refs,
            getReferenceProps,
            getFloatingProps,
            transformOrigin,
        ],
    );

    return (
        <ContextMenuContext.Provider value={contextValue}>
            {props.children}
        </ContextMenuContext.Provider>
    );
}

interface ContextMenuTriggerProps {
    children: ReactNode;
}

export function ContextMenuTrigger(props: ContextMenuTriggerProps) {
    const context = useContext(ContextMenuContext);
    if (context === null) {
        throw new Error(
            'ContextMenuTrigger must be a descendant of ContextMenu',
        );
    }
    if (!isValidElement(props.children)) {
        throw new Error('ContextMenuTrigger must have exactly one child');
    }
    return React.cloneElement(
        props.children,
        context.getReferenceProps({
            ref: context.refs.setReference,
            ...props.children.props,
        }),
    );
}

interface ContextMenuContentProps {
    children: ReactNode;
}

export function ContextMenuContent(props: ContextMenuContentProps) {
    const context = useContext(ContextMenuContext);
    if (context === null) {
        throw new Error(
            'ContextMenuContent must be a descendant of ContextMenu',
        );
    }

    if (!context.open) {
        return null;
    }

    return (
        <FloatingPortal id="root">
            <div
                ref={context.refs.setFloating}
                style={context.floatingStyles}
                {...context.getFloatingProps()}
            >
                <Menu style={{ transformOrigin: context.transformOrigin }}>
                    {props.children}
                </Menu>
            </div>
        </FloatingPortal>
    );
}

export function ContextMenuItem(props: MenuItemProps) {
    const { onClick, ...otherProps } = props;

    const context = useContext(ContextMenuContext);
    if (context === null) {
        throw new Error('ContextMenuItem must be a descendant of ContextMenu');
    }

    return (
        <MenuItem
            {...otherProps}
            onClick={(e) => {
                onClick?.(e);
                context.setOpen(false);
            }}
        />
    );
}
