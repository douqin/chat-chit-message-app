import { IRouteDefinition, RequestMethod } from "./router.definition.interface";

export function GET(url: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (!Reflect.hasMetadata('routes', target)) {
            Reflect.defineMetadata('routes', [], target);
          }
          // Lấy giá trị routes đã được lưu trước đó, thêm vào một route mới và set lại vào metadata.
          const routes: IRouteDefinition[] = Reflect.getMetadata('routes', target);
          routes.push({
            requestMethod: RequestMethod.GET,
            path : url,
            methodName: propertyKey,
          });
          Reflect.defineMetadata('routes', routes, target);
    };
}