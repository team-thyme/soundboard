import React, { useContext } from 'react';
import { Theme, ThemeContext } from './App';

export default function ThemeSelect(): JSX.Element {
    const { theme, setTheme } = useContext(ThemeContext);

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

interface ThemeThumbProps {
    theme: Theme;
}

function ThemeThumb({ theme }: ThemeThumbProps): JSX.Element {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="ThemeThumb"
            data-theme={theme}
            width={120}
            height={90}
            viewBox="0 0 120 90"
        >
            {/* Header */}
            <rect className="ThemeThumb__header" width={120} height={22} />
            <text
                className="ThemeThumb__headerTitle"
                fontSize={10}
                x={5}
                y={15}
                textAnchor="start"
            >
                Sb
            </text>
            <rect
                className="ThemeThumb__search"
                x={30}
                y={4}
                width={60}
                height={14}
                rx={2}
                ry={2}
            />
            <circle className="ThemeThumb__headerIcon" cx={110} cy={11} r={2} />
            <circle className="ThemeThumb__headerIcon" cx={104} cy={11} r={2} />

            {/* Samples */}
            <rect
                className="ThemeThumb__sampleList"
                y={22}
                width={120}
                height={68}
            />

            {/* TODO: Add samples */}
        </svg>
    );
}
