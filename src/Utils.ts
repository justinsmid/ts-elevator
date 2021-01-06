export const arrayOfLength = <T> (n: number, initialValueGenerator?: (i: number) => T) => {
    let array = new Array(n).fill(undefined);
    
    if (initialValueGenerator) {
        array = array.map((_, i) => initialValueGenerator(i));
    }

    return array;
}
