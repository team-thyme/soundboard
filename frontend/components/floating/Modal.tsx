import {
    arrow,
    FloatingFocusManager,
    FloatingPortal,
    offset,
    shift,
    useClick,
    useDismiss,
    useFloating,
    useInteractions,
    useRole,
} from '@floating-ui/react';
import {
    cloneElement,
    createContext,
    type Dispatch,
    isValidElement,
    type JSX,
    MutableRefObject,
    type ReactNode,
    type SetStateAction,
    useContext,
    useRef,
    useState,
} from 'react';

type ModalContextValue = {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    arrowRef: MutableRefObject<HTMLDivElement | null>;
} & ReturnType<typeof useFloating> &
    ReturnType<typeof useInteractions>;

const ModalContext = createContext<ModalContextValue | null>(null);

interface ModalProps {
    children: ReactNode;
}

export function Modal(props: ModalProps): JSX.Element {
    const [open, setOpen] = useState(false);
    const arrowRef = useRef<HTMLDivElement | null>(null);

    const useFloatingResult = useFloating({
        open,
        onOpenChange: setOpen,
        middleware: [
            offset({ mainAxis: 6 }),
            shift({ padding: 10 }),
            arrow({ element: arrowRef, padding: 10 }),
        ],
    });

    const useInteractionsResult = useInteractions([
        useClick(useFloatingResult.context),
        useDismiss(useFloatingResult.context, {
            ancestorScroll: true,
        }),
        useRole(useFloatingResult.context, {
            role: 'dialog',
        }),
    ]);

    return (
        <ModalContext.Provider
            value={{
                ...useFloatingResult,
                ...useInteractionsResult,
                open,
                setOpen,
                arrowRef,
            }}
        >
            {props.children}
        </ModalContext.Provider>
    );
}

interface ModalTriggerProps {
    children: ReactNode;
}

export function ModalTrigger(props: ModalTriggerProps): JSX.Element {
    const context = useContext(ModalContext);
    if (context === null) {
        throw new Error('ModalTrigger must be a descendant of Modal');
    }
    if (!isValidElement(props.children)) {
        throw new Error('ModalTrigger must have exactly one child');
    }
    return cloneElement(
        props.children,
        context.getReferenceProps({
            ref: context.refs.setReference,
            ...props.children.props,
        }),
    );
}

interface ModalContentProps {
    children: ReactNode;
}

export function ModalContent(props: ModalContentProps): JSX.Element | null {
    const context = useContext(ModalContext);
    if (context === null) {
        throw new Error('ModalContent must be a descendant of Modal');
    }
    if (!context.open) {
        return null;
    }
    return (
        <FloatingPortal id="root">
            <FloatingFocusManager context={context.context}>
                <div
                    className="Modal"
                    data-floating-ui-placement={context.placement}
                    {...context.getFloatingProps({
                        ref: context.refs.setFloating,
                        style: context.floatingStyles,
                    })}
                >
                    <div
                        ref={context.arrowRef}
                        className="Modal__arrow"
                        style={{
                            left: context.middlewareData.arrow?.x,
                            top: context.middlewareData.arrow?.y,
                        }}
                    />
                    <div className="Modal__content">{props.children}</div>
                </div>
            </FloatingFocusManager>
        </FloatingPortal>
    );
}
