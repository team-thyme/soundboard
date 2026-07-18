import {
    type ElementProps,
    flip,
    type FloatingContext,
    FloatingFocusManager,
    FloatingPortal,
    shift,
    useClientPoint,
    useDismiss,
    useFloating,
    useInteractions,
    useRole,
} from '@floating-ui/react';
import { type IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    cloneElement,
    type ComponentPropsWithoutRef,
    createContext,
    type Dispatch,
    isValidElement,
    type MouseEventHandler,
    type ReactNode,
    type SetStateAction,
    useContext,
    useMemo,
    useState,
} from 'react';

import { getShiftTransformOrigin } from '../../helpers/floating-ui/getTransformOrigin';

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
                    <div
                        className="ContextMenu"
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        style={{
                            transformOrigin: `${transformOrigin.x} ${transformOrigin.y}`,
                        }}
                    >
                        {props.children}
                    </div>
                </div>
            </FloatingFocusManager>
        </FloatingPortal>
    );
}

interface ContextMenuItemOwnProps {
    icon: IconProp;
    title: string;
    shortcut?: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
}

type ContextMenuItemProps = ContextMenuItemOwnProps &
    Omit<ComponentPropsWithoutRef<'button'>, keyof ContextMenuItemOwnProps>;

export function ContextMenuItem(props: ContextMenuItemProps) {
    const { icon, title, shortcut, onClick, ...otherProps } = props;

    const context = useContext(ContextMenuContext);
    if (context === null) {
        throw new Error('ContextMenuItem must be a descendant of ContextMenu');
    }

    return (
        <button
            role="menuitem"
            className="ContextMenuItem"
            onClick={(e) => {
                onClick?.(e);
                context.setOpen(false);
            }}
            {...otherProps}
        >
            <span className="ContextMenuItem__icon">
                <FontAwesomeIcon icon={icon} />
            </span>
            <span className="ContextMenuItem__title">{title}</span>
            <span className="ContextMenuItem__shortcut">{shortcut}</span>
        </button>
    );
}
