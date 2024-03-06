export function computeLayout(
    itemWidths: number[],
    maxRowWidth: number,
): number[][] {
    if (itemWidths.length === 0) {
        return [];
    }

    // TODO: Better layout computation. Perhaps do local search (with badness like LaTeX) after the current greedy approach.
    let rows: number[][] = [[]];
    let rowWidth = 0;
    for (let itemIndex = 0; itemIndex < itemWidths.length; ++itemIndex) {
        if (rowWidth === 0 || rowWidth + itemWidths[itemIndex] <= maxRowWidth) {
            rowWidth += itemWidths[itemIndex];
            rows[rows.length - 1].push(itemIndex);
        } else {
            rowWidth = itemWidths[itemIndex];
            rows.push([itemIndex]);
        }
    }
    return rows;
}
