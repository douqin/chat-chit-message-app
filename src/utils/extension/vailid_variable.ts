export default function validVariable(yourVariable: any): boolean {
    return yourVariable !== null && yourVariable !== undefined && !isNaN(yourVariable)
}