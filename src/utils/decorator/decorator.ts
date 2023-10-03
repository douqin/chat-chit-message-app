export default function Controller(router: string) {
    return function <T extends {
        new(...args: any[]): {
        }
    }>(constructor: T) {

    }
}