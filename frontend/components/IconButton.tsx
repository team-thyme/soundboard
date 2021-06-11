import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ButtonHTMLAttributes } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: IconProp;
    kind: 'search' | 'header';
}

export default function IconButton({
    icon,
    kind,
    ...otherProps
}: IconButtonProps) {
    return (
        <button className={`IconButton IconButton--${kind}`} {...otherProps}>
            <FontAwesomeIcon icon={icon} />
        </button>
    );
}
