export function computeLayout(
    itemWidths: number[],
    maxRowWidth: number,
    columnGap: number,
): number[][] {
    if (itemWidths.length === 0) {
        return [];
    }

    // TODO: Better layout computation. Perhaps do local search (with badness like LaTeX) after the current greedy approach.
    let rows: number[][] = [];
    let rowWidth = 0;
    for (let itemIndex = 0; itemIndex < itemWidths.length; ++itemIndex) {
        const itemWidth = itemWidths[itemIndex];
        if (rowWidth > 0 && rowWidth + columnGap + itemWidth <= maxRowWidth) {
            // Add to current row
            rowWidth += columnGap + itemWidth;
            rows[rows.length - 1].push(itemIndex);
        } else {
            // Start new row
            rowWidth = itemWidth;
            rows.push([itemIndex]);
        }
    }
    console.log(rows);
    return rows;
}
