import { type JSX } from 'react';

import { Theme, usePreference } from '../../helpers/preferences';
import { ThemeThumb } from './ThemeThumb';

export default function ThemeSelect(): JSX.Element {
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
