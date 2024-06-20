import {CustomComponent, CustomComponents} from "../../env/type";
import {createDOMNode, createVComponent} from "./vdom";
import {lex, parse} from "./ast";
import {onMountedList} from "./hooks/onMounted";
import {onUnMountedList} from "./hooks/OnUnMounted";

export function createApp(rootComponent: CustomComponent<any, any>, components: CustomComponents) {
    components[rootComponent.name] = rootComponent
    const virtualRoot = createVComponent(rootComponent.name, components, rootComponent.setup(), parse(lex(rootComponent.template), components).children)
    const dom = createDOMNode(virtualRoot)

    return {
        mount: (selector: string)=>{
            const root = document.querySelector(selector)
            root.innerHTML = ''
            root.appendChild(dom)

            for (const key in onMountedList) {
                onMountedList[key].forEach((callback)=> callback())
            }
        },
        unMount(){
            (dom as HTMLElement).remove();
            for (const key in onUnMountedList) {
                onUnMountedList[key].forEach((callback)=> callback())
            }
        },
        getDOM(){
            return dom
        },
        getTree(){
            return virtualRoot
        }
    }
}