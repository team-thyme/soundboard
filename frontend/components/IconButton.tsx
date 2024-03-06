import { type IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';
import { type ComponentPropsWithoutRef, type ForwardedRef } from 'react';

interface OwnProps {
    icon: IconProp;
    kind: 'search' | 'header';
    innerRef?: ForwardedRef<HTMLButtonElement>;
}

export type IconButtonProps = OwnProps & ComponentPropsWithoutRef<'button'>;

export function IconButton({
    icon,
    kind,
    innerRef,
    ...otherProps
}: IconButtonProps) {
    return (
        <button
            ref={innerRef}
            type="button"
            className={cx('IconButton', `IconButton--${kind}`)}
            {...otherProps}
        >
            <FontAwesomeIcon icon={icon} />
        </button>
    );
}
