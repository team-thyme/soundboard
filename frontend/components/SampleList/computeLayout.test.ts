import computeLayout from './computeLayout';

test('two items on a single row', () => {
    expect(computeLayout([1, 1], 3)).toStrictEqual([[0, 1]]);
});

test('three items exactly filling a single row', () => {
    expect(computeLayout([1, 1, 1], 3)).toStrictEqual([[0, 1, 2]]);
});

test('four items overflowing a single row', () => {
    expect(computeLayout([1, 1, 1, 1], 3)).toStrictEqual([[0, 1, 2], [3]]);
});
