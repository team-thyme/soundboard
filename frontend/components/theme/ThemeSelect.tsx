import { type JSX } from 'react';

import { Theme, usePreference } from '../../helpers/preferences';
import { ThemeThumb } from './ThemeThumb';

export default function ThemeSelect(): JSX.Element {
    const [theme, setTheme] = usePreference('theme');

    return (
        <div>
            {Object.entries(Theme).map(([key, value]) => (
                <div key={key}>
                    <label>
                        <input
                            name="theme"
                            type="radio"
                            value={value}
                            checked={theme === value}
                            onChange={() => {
                                setTheme(value);
                            }}
                        />
                        {key}
                        <ThemeThumb theme={value} />
                    </label>
                </div>
            ))}
        </div>
    );
}
