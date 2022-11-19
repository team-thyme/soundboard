import computeLayout from './computeLayout';

test('no items', () => {
    expect(computeLayout([], 3)).toStrictEqual([]);
});

test('two items on a single row', () => {
    expect(computeLayout([1, 1], 3)).toStrictEqual([[0, 1]]);
});

test('three items exactly filling a single row', () => {
    expect(computeLayout([1, 1, 1], 3)).toStrictEqual([[0, 1, 2]]);
});

test('four items overflowing a single row', () => {
    expect(computeLayout([1, 1, 1, 1], 3)).toStrictEqual([[0, 1, 2], [3]]);
});

test('single item larger than max row width', () => {
    expect(computeLayout([4], 3)).toStrictEqual([[0]]);
});

test('second item larger than max row width', () => {
    expect(computeLayout([1, 4], 3)).toStrictEqual([[0], [1]]);
});
