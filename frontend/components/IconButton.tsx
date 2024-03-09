import { type IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';
import {
    type ComponentPropsWithoutRef,
    type ForwardedRef,
    forwardRef,
    type JSX,
} from 'react';

interface IconButtonOwnProps {
    icon: IconProp;
    kind: 'search' | 'header';
}

export type IconButtonProps = IconButtonOwnProps &
    ComponentPropsWithoutRef<'button'>;

export const IconButton = forwardRef(function IconButton(
    props: IconButtonProps,
    ref: ForwardedRef<HTMLButtonElement>,
): JSX.Element {
    const { icon, kind, ...otherProps } = props;
    return (
        <button
            ref={ref}
            type="button"
            className={cx('IconButton', `IconButton--${kind}`)}
            {...otherProps}
        >
            <FontAwesomeIcon icon={icon} />
        </button>
    );
});
