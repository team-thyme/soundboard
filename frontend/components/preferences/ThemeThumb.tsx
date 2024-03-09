import { type JSX } from 'react';

import { type Theme } from '../../helpers/preferences';

interface ThemeThumbProps {
    theme: Theme;
}

export function ThemeThumb({ theme }: ThemeThumbProps): JSX.Element {
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

            <g transform="translate(0, 27)" data-index-mod3={0}>
                <rect
                    className="ThemeThumb__sampleItem"
                    x={5}
                    width={30}
                    height={10}
                />
                <rect
                    className="ThemeThumb__sampleItem ThemeThumb__sampleItem--playing"
                    x={38}
                    width={20}
                    height={10}
                />
                <rect
                    className="ThemeThumb__sampleItem"
                    x={61}
                    width={31}
                    height={10}
                />
                <rect
                    className="ThemeThumb__sampleItem"
                    x={95}
                    width={20}
                    height={10}
                />
            </g>
            <g transform="translate(0, 40)" data-index-mod3={1}>
                <rect
                    className="ThemeThumb__sampleItem"
                    x={5}
                    width={18}
                    height={10}
                />
                <rect
                    className="ThemeThumb__sampleItem"
                    x={26}
                    width={14}
                    height={10}
                />
                <rect
                    className="ThemeThumb__sampleItem"
                    x={43}
                    width={24}
                    height={10}
                />
                <rect
                    className="ThemeThumb__sampleItem"
                    x={70}
                    width={17}
                    height={10}
                />
                <rect
                    className="ThemeThumb__sampleItem"
                    x={90}
                    width={25}
                    height={10}
                />
            </g>
            <g transform="translate(0, 53)" data-index-mod3={2}>
                <rect
                    className="ThemeThumb__sampleItem"
                    x={5}
                    width={30}
                    height={10}
                />
                <rect
                    className="ThemeThumb__sampleItem"
                    x={38}
                    width={20}
                    height={10}
                />
                <rect
                    className="ThemeThumb__sampleItem"
                    x={61}
                    width={31}
                    height={10}
                />
                <rect
                    className="ThemeThumb__sampleItem"
                    x={95}
                    width={20}
                    height={10}
                />
            </g>
            <g transform="translate(0, 66)" data-index-mod3={0}>
                <rect
                    className="ThemeThumb__sampleItem"
                    x={5}
                    width={18}
                    height={10}
                />
                <rect
                    className="ThemeThumb__sampleItem"
                    x={26}
                    width={14}
                    height={10}
                />
                <rect
                    className="ThemeThumb__sampleItem"
                    x={43}
                    width={24}
                    height={10}
                />
            </g>
        </svg>
    );
}
