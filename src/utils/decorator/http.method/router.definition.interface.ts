// models/Route.definition.ts
export enum RequestMethod {
    GET = 'get',
    POST = 'post',
    DELETE = 'delete',
    OPTIONS = 'options',
    PUT = 'put',
    PATCH = "patch"
}

export interface IRouteDefinition {
    // Path cho route
    path: string;
    // Phương thức http
    requestMethod: RequestMethod;
    // Tên phương thức của class controller để xử lý request
    methodName: string | symbol;
}