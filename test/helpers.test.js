import helpers from '../src/helpers';
const { isEmpty } = helpers;

test('判断数据为空 ``', () => {
    expect(
        isEmpty('')
    ).toEqual(true);
});


test('判断数据为空 `null`', () => {
    expect(
        isEmpty(null)
    ).toEqual(true);
});



test('判断数据为空 `undefined`', () => {
    expect(
        isEmpty(undefined)
    ).toEqual(true);
});

test('判断数据为空 `1`', () => {
    expect(
        isEmpty('1')
    ).toEqual(false);
});
