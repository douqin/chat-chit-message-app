export default function validVariable(yourVariable: number): boolean {
    return yourVariable !== null && yourVariable !== undefined && !isNaN(yourVariable)
}