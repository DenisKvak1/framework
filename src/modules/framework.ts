import { CustomComponent, CustomComponents, LifeCycle, VComponentNode } from '../../env/type';
import { ASTHelper } from './ASTHelper';
import { VDOMHelper } from './VDOMHelper';
import { callLifeCycle } from './hooks/LifeCycles';
import { ComponentHelper } from './componentHelper';


export class Framework {
    private virtualRoot: VComponentNode;
    private dom: HTMLElement
    private rootComponent: CustomComponent<any, any>
    componentHelper= new ComponentHelper(this);
    ASTHelper = new ASTHelper(this)
    VDOMHelper = new VDOMHelper(this)
    components: CustomComponents;

    constructor(rootComponent: CustomComponent<any, any>, components: CustomComponents) {
        this.rootComponent = rootComponent
        this.components = components
        this.init()
    }

    private init(){
        this.components[this.rootComponent.name] = this.rootComponent
        this.virtualRoot = this.componentHelper.createComponentInstance(this.rootComponent)
        this.dom = this.VDOMHelper.createDOMNode(this.virtualRoot) as HTMLElement
    }

    mount(selector: string){
        const root = document.querySelector(selector)
        root.innerHTML = ''
        root.appendChild(this.dom)
        callLifeCycle(this.virtualRoot, LifeCycle.MOUNTED)
    }

    unMount(){
        this.dom.remove()
        callLifeCycle(this.virtualRoot, LifeCycle.UNMOUNTED)
    }
}