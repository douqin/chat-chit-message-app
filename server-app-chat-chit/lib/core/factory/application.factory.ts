import { globalContainer, MotherController } from "@/lib/common";
import { App } from "@/lib/core";
import { TypeClass } from "@/lib/types";
export class ApplicationFactory<T> {
  static createApplication<T, V>(moduleClass: TypeClass<V>): App {
    let app = new App();
    app.createControllers(
      ApplicationFactory.getControllerFromModule(moduleClass).map(
        (controller) => globalContainer.resolve(controller)
      ) as MotherController[]
    );
    return app;
  }
  static getControllerFromModule<V>(moduleClass: TypeClass<V>) {
    let module = new moduleClass() as any;
    return module.controllers as TypeClass<MotherController>[];
  }
}
