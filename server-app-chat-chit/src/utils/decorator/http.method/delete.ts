import { IRouteDefinition, RequestMethod } from "./router.definition.interface";

export function DELETE(url: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    if (!Reflect.hasMetadata('routes', target)) {
      Reflect.defineMetadata('routes', [], target);
    }
    const routes: IRouteDefinition[] = Reflect.getMetadata('routes', target);
    routes.push({
      requestMethod: RequestMethod.DELETE,
      path: url,
      methodName: propertyKey,
    });
    Reflect.defineMetadata('routes', routes, target);
  };
}