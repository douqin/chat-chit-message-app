// const isArrayOf = <T>(elemGuard: (x: any) => x is T) =>
//     (arr: any[]): arr is Array<T> => arr.every(elemGuard);
// export { isArrayOf };
function isArrayOf<T>(elemGuard: (x: any) => x is T): (arr: any) => arr is T[] {
    return function (arr: any): arr is T[] {
        return Array.isArray(arr) && arr.every(elemGuard);
    };
}
