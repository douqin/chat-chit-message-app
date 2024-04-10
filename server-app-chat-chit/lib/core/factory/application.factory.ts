import { globalContainer, MotherController } from "@/lib/common";
import { App } from "@/lib/core";
import { TypeClass } from "@/lib/types";
import { ServerOptions } from "socket.io";
export class ApplicationFactory<T> {
  static createApplication<T, V>(
    moduleClass: TypeClass<V>,
    opts: {
      initializeSocket?: boolean,
      baseConfigSocket : Partial<ServerOptions>
    }
  ): App {
    let app = new App();
    if (opts.initializeSocket) {
      app.initSocket(opts.baseConfigSocket);
    }
    app.initilizeController(
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
