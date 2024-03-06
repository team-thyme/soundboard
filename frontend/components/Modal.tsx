import {
    type JSX,
    type ForwardedRef,
    type ComponentPropsWithoutRef,
    type ComponentPropsWithRef,
} from 'react';

interface ModalOwnProps {
    innerRef?: ForwardedRef<HTMLDivElement>;
    arrowProps?: ComponentPropsWithRef<'div'>;
}

type ModalProps = ModalOwnProps & ComponentPropsWithoutRef<'div'>;

export function Modal({
    children,
    innerRef,
    arrowProps,
    ...otherProps
}: ModalProps): JSX.Element {
    return (
        <div ref={innerRef} className="Modal" role="dialog" {...otherProps}>
            {arrowProps && <div className="Modal__arrow" {...arrowProps} />}
            <div className="Modal__content">{children}</div>
        </div>
    );
}

type ModalLayerProps = React.ComponentPropsWithoutRef<'div'>;

export function ModalLayer(props: ModalLayerProps): JSX.Element {
    return <div className="ModalLayer" {...props} />;
}
