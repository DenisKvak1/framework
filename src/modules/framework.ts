import { IComponentInstance, CustomComponent, CustomComponents, VNode } from '../../env/type';
import { AST } from './ast';
import { VDOM } from './vdom';

export const ComponentInstance:{value:IComponentInstance} = {value: null}

export class Framework {
    private virtualRoot: VNode;
    private dom: HTMLElement
    private rootComponent: CustomComponent<any, any>
    AST = new AST(this)
    VDOM= new VDOM(this)
    components: CustomComponents;

    constructor(rootComponent: CustomComponent<any, any>, components: CustomComponents) {
        this.rootComponent = rootComponent
        this.components = components
        this.init()
    }

    private init(){
        this.components[this.rootComponent.name] = this.rootComponent
        this.virtualRoot = this.VDOM.createVComponent(this.rootComponent.name, this.rootComponent.setup(), this.AST.parse(this.AST.lex(this.rootComponent.template)).children, this.rootComponent.style)
        this.dom = this.VDOM.createDOMNode(this.virtualRoot) as HTMLElement
    }

    mount(selector: string){
        const root = document.querySelector(selector)
        root.innerHTML = ''
        root.appendChild(this.dom)
    }

    unMount(){
        this.dom.remove()
    }
}