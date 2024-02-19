export function isValidNumberVariable(yourVariable: number): boolean {
    return yourVariable !== null && yourVariable !== undefined && !isNaN(yourVariable)
}