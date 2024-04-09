import { singleton } from "tsyringe";

export function Controller(router: string) {
    return function <T extends {
        new(...args: any[]): {
        }
    }>(_class: T) {
        let a = class extends _class {
            pathMain = router;
        };
        singleton()(a);
        return a;
    }
}
