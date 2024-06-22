export type HTMLTemplate = string

export type Effect = () => void;
export type DepsMap = Map<PropertyKey, Set<Effect>>;
export type TargetMap = WeakMap<object, DepsMap>;
export type Ref<T> = {
    value: T;
    toString: () => string;
    valueOf: ()=> T;
    __isRef: boolean;
}
export type ReactiveHandler<T extends object> = {
    get(target: T, key: PropertyKey, receiver: any): any;
    set(target: T, key: PropertyKey, value: any, receiver: any): boolean;
};

export type tokenType = 'tag-end' | 'tag-start' | 'bind' | 'handler' | 'prop' | 'interpolation' | 'text'
export type tokenName = string
export type tokenValue = string
export enum LifeCycle {
    MOUNTED = "mounted",
    UNMOUNTED = "unMounted"
}
export type LexTree = {
    type: tokenType,
    name?: tokenName
    value: tokenValue
}[]
export type hookList = Function[]
export type lifeCycles = {
    [key in LifeCycle]: hookList
};

export type HTMLTemplateDate = any
export type VNodeText = string
export type VNodeTypes = 'element' | 'component' | 'root' | 'text' | 'interpolation'
export type VNodeTagName = string
export type componentID = string

export type VNodeProps = {
    [key:string]: Ref<any> | string
}
export type VNodeHandlers = {
    [key: string]: string
}
export type VNodeBinds = {
    [key: string]: string | {[key: string]: Ref<boolean>}
}
export type VNodeComponentProps = any
export type directives = {
    [key:string]: string | Ref<any>
}

export type VTextNode = {
    content: VNodeText
}
export type VInterpolationNode = {
    type: "interpolation",
    parentComponent: VComponentNode,
    content: string
}
export type VElementNode = {
    type: "element",
    tagName: VNodeTagName,
    binds: VNodeBinds,
    props: VNodeProps,
    handlers: VNodeHandlers,
    directives: directives,
    children: VNode[],
}
export type VComponentNode = {
    uid: componentID
    type: "component",
    tagName: VNodeTagName,
    props:  VNodeComponentProps,
    handlers: VNodeHandlers,
    directives: directives,
    style: string,
    lifeCycles: lifeCycles
    children: VNode[],
}
export type VNode = {
    uid?: componentID
    type: VNodeTypes,
    tagName?: VNodeTagName,
    props?: any,
    binds?: any
    handlers?: VNodeHandlers,
    content?: any
    directives?: directives,
    style?: string,
    lifeCycles?: lifeCycles
    parentComponent?: VComponentNode
    children?: VNode[]
}

export type CustomComponent<props, templatedData> = {
    name: string,
    template: HTMLTemplate,
    setup(props?: props): templatedData,
    style: string
}

export type CustomComponents = {
    [key: string]: CustomComponent<any, any>
}