import { ComponentPropsWithoutRef, ForwardedRef, forwardRef } from 'react';

export type MenuProps = Omit<
    ComponentPropsWithoutRef<'div'>,
    'onClick' | 'role' | 'className'
>;

export const Menu = forwardRef(function Menu(
    { children, ...otherProps }: MenuProps,
    forwardedRef: ForwardedRef<HTMLDivElement>,
) {
    return (
        <div
            ref={forwardedRef}
            role="menu"
            className="ContextMenu"
            onClick={(e) => {
                e.stopPropagation();
            }}
            {...otherProps}
        >
            <ul className="ContextMenu__items">{children}</ul>
        </div>
    );
});
