import { type JSX, useId } from 'react';

import { Theme, usePreference } from '../../helpers/preferences';
import { ThemeThumb } from './ThemeThumb';

export function ThemeSection() {
    const id = useId();

    return (
        <div className="Preferences__section">
            <label className="Preferences__label" htmlFor={id}>
                Theme
            </label>
            <ThemeSelect id={id} />
        </div>
    );
}

interface ThemeSelectProps {
    id: string;
}

function ThemeSelect(props: ThemeSelectProps): JSX.Element {
    const { id } = props;
    const [theme, setTheme] = usePreference('theme');

    return (
        <div className="ThemeSelect">
            {Object.entries(Theme).map(([key, value]) => (
                <label key={key} className="ThemeSelect__item">
                    <span className="ThemeSelect__thumb">
                        <ThemeThumb theme={value} />
                    </span>
                    <span className="ThemeSelect__label">
                        <input
                            id={theme === value ? id : undefined}
                            className="ThemeSelect__input"
                            name="theme"
                            type="radio"
                            value={value}
                            checked={theme === value}
                            onChange={() => {
                                setTheme(value);
                            }}
                        />
                        {key}
                    </span>
                </label>
            ))}
        </div>
    );
}
