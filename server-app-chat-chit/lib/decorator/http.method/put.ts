import { IRouteDefinition, RequestMethod } from "./definition/router.definition.interface";

export function PUT(url: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (!Reflect.hasMetadata('routes', target)) {
            Reflect.defineMetadata('routes', [], target);
          }
          // Lấy giá trị routes đã được lưu trước đó, thêm vào một route mới và set lại vào metadata.
          const routes: IRouteDefinition[] = Reflect.getMetadata('routes', target);
          routes.push({
            requestMethod: RequestMethod.PUT,
            path : url,
            methodName: propertyKey,
          });
          Reflect.defineMetadata('routes', routes, target);
    };
}