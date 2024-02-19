import { ValidationError } from "class-validator";

export class ValidateErrorBuilder {
    private instance: ValidationError;
    constructor() {
        this.instance = new ValidationError();
    }
    setProperty(property: string): ValidateErrorBuilder {
        this.instance.property = property;
        return this;
    }
    setTarget(target: object): ValidateErrorBuilder {
        this.instance.target = target;
        return this;
    }
    setConstraints(constraints: { [type: string]: string }): ValidateErrorBuilder {
        this.instance.constraints = constraints;
        return this;
    }
    setChildren(children: ValidationError[]): ValidateErrorBuilder {
        this.instance.children = children;
        return this;
    }
    setContexts(contexts: { [type: string]: any }): ValidateErrorBuilder {
        this.instance.contexts = contexts;
        return this;
    }
    setValueOfProperty(value: any): ValidateErrorBuilder {
        this.instance.value = value;
        return this;
    }
    build() {
        return this.instance;
    }
    toJson() {
        return JSON.parse(JSON.stringify(this.instance))
    }
    WrapArrayToJson() {
        return JSON.parse(JSON.stringify([this.instance]))
    }
}