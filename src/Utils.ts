export const arrayOfLength = <T>(n: number, initialValueGenerator?: (i: number) => T) => {
    let array = new Array(n).fill(undefined);

    if (initialValueGenerator) {
        array = array.map((_, i) => initialValueGenerator(i));
    }

    return array;
}

export const minOfArray = (array: number[]): number | null => array.length > 0 ? Math.min(...array) : null;
export const maxOfArray = (array: number[]): number | null => array.length > 0 ? Math.max(...array) : null;

export const addIfNotIncluded = <T> (array: T[], element: T, comparator?: ((element: T) => boolean)): T[] => {
    if (comparator) {
        return array.findIndex(comparator) === -1 ? [...array, element] : array;
    } else {
        return array.includes(element) ? array : [...array, element];
    }
};
