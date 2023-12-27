import { singleton } from "tsyringe";

export default function Controller(router: string) {
    return function <T extends {
        new(...args: any[]): {
        }
    }>(constructor: T) {
        let a = class extends constructor {
            pathMain = router;
        };
        singleton()(a);
        return a;
    }
}
