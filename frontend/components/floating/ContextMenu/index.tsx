import {
    type ElementProps,
    flip,
    type FloatingContext,
    FloatingFocusManager,
    FloatingPortal,
    type Placement,
    shift,
    useClientPoint,
    useDismiss,
    useFloating,
    useInteractions,
    useRole,
} from '@floating-ui/react';
import {
    getSide,
    getSideAxis,
    getAlignment,
    getAlignmentAxis,
} from '@floating-ui/utils';
import {
    cloneElement,
    createContext,
    type Dispatch,
    isValidElement,
    type ReactNode,
    type SetStateAction,
    useContext,
    useMemo,
    useState,
} from 'react';

import { Menu } from './Menu';
import { MenuItem, type MenuItemProps } from './MenuItem';

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

/**
 * Compute transform origin based on placement.
 */
function getTransformOrigin(placement: Placement): { x: string; y: string } {
    const side = getSide(placement);
    const axis = getSideAxis(placement);
    const alignment = getAlignment(placement);
    const alignmentAxis = getAlignmentAxis(placement);
    return {
        [axis]: side === 'top' || side === 'left' ? '100%' : '0%',
        [alignmentAxis]:
            alignment === 'start' ? '0%' : alignment === 'end' ? '100%' : '50%',
    } as { x: string; y: string };
}

/**
 * Compute transform origin based on placement and result of shift middleware.
 */
function getShiftTransformOrigin(
    placement: Placement,
    shift?: { x: number; y: number },
): { x: string; y: string } {
    const transformOrigin = getTransformOrigin(placement);
    return {
        x: `calc(${transformOrigin.x} - ${shift?.x ?? 0}px)`,
        y: `calc(${transformOrigin.y} - ${shift?.y ?? 0}px)`,
    };
}

type ContextMenuContextValue = {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
} & ReturnType<typeof useFloating> &
    ReturnType<typeof useInteractions>;

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

    const useFloatingResult = useFloating({
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
        middleware: [flip({ padding: 10 }), shift({ padding: 10 })],
    });

    const useInteractionsResult = useInteractions([
        useRole(useFloatingResult.context, {
            role: 'menu',
        }),
        useContextMenu(useFloatingResult.context),
        useDismiss(useFloatingResult.context, {
            escapeKey: true,
            referencePress: true,
            outsidePress: true,
            ancestorScroll: true,
        }),
        useClientPoint(useFloatingResult.context, {
            enabled: position !== null,
            ...position,
        }),
    ]);

    return (
        <ContextMenuContext.Provider
            value={{
                open,
                setOpen,
                ...useFloatingResult,
                ...useInteractionsResult,
            }}
        >
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
    return cloneElement(
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

    const transformOrigin = getShiftTransformOrigin(
        context.placement,
        context.middlewareData.shift,
    );

    return (
        <FloatingPortal id="root">
            <FloatingFocusManager context={context.context}>
                <div
                    ref={context.refs.setFloating}
                    style={context.floatingStyles}
                    {...context.getFloatingProps()}
                >
                    <Menu
                        style={{
                            transformOrigin: `${transformOrigin.x} ${transformOrigin.y}`,
                        }}
                    >
                        {props.children}
                    </Menu>
                </div>
            </FloatingFocusManager>
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
