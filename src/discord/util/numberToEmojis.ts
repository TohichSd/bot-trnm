export default (num: number): string => {
    const digitStrings = {
        0: 'zero',
        1: 'one',
        2: 'two',
        3: 'three',
        4: 'four',
        5: 'five',
        6: 'six',
        7: 'seven',
        8: 'eight',
        9: 'nine',
        '-': 'heavy_minus_sign',
    }

    return num
        .toString()
        .split('')
        .map(digit => `:${digitStrings[digit]}:`)
        .join(' ')
}