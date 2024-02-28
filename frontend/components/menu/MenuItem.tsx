import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ComponentPropsWithoutRef, ForwardedRef, forwardRef } from 'react';

interface MenuItemOwnProps {
    icon: IconProp;
    title: string;
    shortcut?: string;
}

export type MenuItemProps = MenuItemOwnProps &
    Omit<
        ComponentPropsWithoutRef<'button'>,
        keyof MenuItemOwnProps | 'role' | 'className'
    >;

export const MenuItem = forwardRef(
    (
        { icon, title, shortcut, ...otherProps }: MenuItemProps,
        forwardedRef: ForwardedRef<HTMLButtonElement>,
    ) => {
        return (
            <button
                ref={forwardedRef}
                role="menuitem"
                className="ContextMenuItem"
                {...otherProps}
            >
                <span className="ContextMenuItem__icon">
                    {<FontAwesomeIcon icon={icon} />}
                </span>
                <span className="ContextMenuItem__title">{title}</span>
                <span className="ContextMenuItem__shortcut">{shortcut}</span>
            </button>
        );
    },
);
