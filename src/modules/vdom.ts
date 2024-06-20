import {
    CustomComponents, directives,
    HTMLTemplateDate,
    VComponentNode,
    VElementNode,
    VInterpolationNode,
    VNode,
    VNodeBinds,
    VNodeHandlers,
    VNodeProps,
    VNodeTagName,
    VNodeText,
    VTextNode
} from "../../env/type";
import {indexingParentComponents, processPropsComponent} from "./ast";
import {computed, effect} from "./reactivity";
import {bindClassEffect, parseExpression, parseStringToObject} from "../../env/helper/helper";

import {conditionalRender} from "./directives/conditionalRender";
import {vModel} from "./directives/vModel";
import {applyScopedStyles} from "../../env/helper/scopedStyle";

export const createVNode = (tagName: VNodeTagName, children?:VNode[], props?: VNodeProps, binds?: VNodeBinds, handlers?: VNodeHandlers, directives?: directives):VElementNode => {
    return {
        type: "element",
        tagName: tagName,
        props: props || {},
        binds: binds || {},
        directives: directives || {},
        handlers: handlers || {},
        children: children || [],
    };
};
export const createVComponent = (tagName: VNodeTagName, components: CustomComponents, props?: VNodeProps, children?: VNode[], handlers?: VNodeHandlers, directives?: directives,):VComponentNode => {
    const component = {
        type: "component",
        tagName,
        props: props || {},
        directives: directives || {},
        children: children || [],
        handlers: handlers || {},
    } as VComponentNode
    const indexingProps = processPropsComponent(component, components)
    const indexingComponent = indexingParentComponents(indexingProps) as VComponentNode
    return indexingComponent
}
export const createVTextNode = (text: VNodeText) => {
    return {
        type: "text",
        content: text
    }
}
export const createInterpolationVTextNode = (text: VNodeText, parentComponent: VNode) => {
    return {
        type: "interpolation",
        parentComponent,
        content: text
    }
}

export const createDOMInterpolationTextNode = (vInterpolationNode: VInterpolationNode, props:HTMLTemplateDate) => {
    const { content } = vInterpolationNode;
    const parseContent = parseExpression(content, props)
    const expression = new Function('dataObj', `with(dataObj) { return ${parseContent}; }`);
    const computedExpression = computed(() => expression(props))
    const node = document.createTextNode(computedExpression.value)

    effect(() => node.textContent = computedExpression.value)
    computedExpression.value.toString()
    return node;
}

export const createDOMTextNode = (vTextNode: VTextNode) => {
    const { content } = vTextNode;
    const node = document.createTextNode(content)

    return node;
};
export const processHandlerData = (data:string, props: HTMLTemplateDate) => {
    const expression = new Function('dataObj', `with(dataObj) { return ${data}; }`);
    return expression(props)
}
export const processDataOneTrend = (data:string, props: HTMLTemplateDate) => {
    const parseData = parseExpression(data, props)
    const expression = new Function('dataObj', `with(dataObj) { return ${parseData}; }`);
    const computedExpression = computed(() => expression(props).valueOf())

    return computedExpression
}
export const processDataTwoTrend = (data:string, props: HTMLTemplateDate) => {
    return props[data]
}
export const createDOMNode = (vNode: VNode) => {
    const { type, tagName, props, directives, style, handlers, children } = vNode;
    let node: Node;
    if (type === "element") {
        node = document.createElement(tagName);


        if (props) {
            Object.entries(props).forEach(([key, value]: [string, any]) => {
                (node as HTMLElement).setAttribute(key, value as string);
            });
        }
    
        if(directives){
            processDirective(vNode, node as HTMLElement)
        }

        if (vNode.binds) {
            processBinds(vNode, node as HTMLElement)
        }

        if (handlers) {
            processHandlers(vNode, node as HTMLElement)
        }

        if (children) {
            children.forEach(child => {
                node.appendChild(createDOMNode(child));
            });
        }
    } else if (type === "component") {
        node = document.createElement(tagName);

        if(style){
            applyScopedStyles(tagName, style)
        }
        if (handlers) {
            processHandlers(vNode, node as HTMLElement)
        }
        if(directives){
            processDirective(vNode, node as HTMLElement)
        }
        if (children) {
            children.forEach(child => {
                node.appendChild(createDOMNode(child));
            });
        }
    } else if (type === "text") {
        node = createDOMTextNode(vNode as VTextNode);
    } else if (type === "interpolation") {
        node = createDOMInterpolationTextNode(vNode as VInterpolationNode, vNode.parentComponent.props);
    } else if (type === "root") {
        node = document.createElement('div');

        if (children) {
            children.forEach(child => {
                node.appendChild(createDOMNode(child));
            });
        }
    }

    return node;
};
function processDirective(vNode:VNode, node:HTMLElement){
    Object.entries(vNode.directives).forEach(([key, value]: [string, string]) => {
        const directives:{[key: string]: Function} = {
            "v-model": ()=>{
                const bind = processDataTwoTrend(value, vNode.parentComponent.props)
                vModel(node, bind)
            },
            "v-if": ()=>{
                const bind = processDataOneTrend(value, vNode.parentComponent.props)
                setTimeout(()=> conditionalRender(bind, node))
            }
        }
        directives[key]()
    });
}
function processHandlers(vNode:VNode, node:HTMLElement){
    const handlersFunc: {[key: string]: (node:Node, func: Function) =>void} = {
        click: (node:HTMLElement, func: Function) => {
            node.addEventListener('click', (e) => func(e))
        },
        input:(node:HTMLElement, func: Function) =>{
            node.addEventListener('input', (e) => func(e))
        },
        change(node:HTMLElement, func: Function){
            node.addEventListener('change', (e) => func(e))
        }
    }

    Object.entries(vNode.handlers).forEach(([key, value]: [string, string]) => {
        handlersFunc[key](node, processHandlerData(value, vNode.parentComponent.props))
    });
}
function processBinds(vNode:VNode, node:HTMLElement){
    Object.entries(vNode.binds).forEach(([key, value]: [string, any]) => {
        if(key === "class"){
            Object.entries(parseStringToObject(value)).forEach(([key2, value2]: [string, string])=>{
                const bind = processDataOneTrend(value2, vNode.parentComponent.props) //TODO
                bindClassEffect(node as HTMLElement, key2, bind)
            })
        }
        const bind = processDataOneTrend(value, vNode.parentComponent.props)
        effect(()=> (node as any)[key] = bind.value)
    });
}
// export const mount = (node, target) => {
//     target.replaceWith(node);
//     return node;
// };
// export const patchNode = (node, vNode, nextVNode) => {
//     // Удаляем ноду, если значение nextVNode не задано
//     if (nextVNode === undefined) {
//         node.remove();
//         return;
//     }
//
//     if (typeof vNode === "string" || typeof nextVNode === "string") {
//         // Заменяем ноду на новую, если как минимум одно из значений равно строке
//         // и эти значения не равны друг другу
//         if (vNode !== nextVNode) {
//             const nextNode = createDOMNode(nextVNode);
//             node.replaceWith(nextNode);
//             return nextNode;
//         }
//
//         // Если два значения - это строки и они равны,
//         // просто возвращаем текущую ноду
//         return node;
//     }
//
//     // Заменяем ноду на новую, если теги не равны
//     if (vNode.tagName !== nextVNode.tagName) {
//         const nextNode = createDOMNode(nextVNode);
//         node.replaceWith(nextNode);
//         return nextNode;
//     }
//
//     // Патчим свойства (реализация будет далее)
//     patchProps(node, vNode.props, nextVNode.props);
//
//     // Патчим детей (реализация будет далее)
//     patchChildren(node, vNode.children, nextVNode.children);
//
//     // Возвращаем обновленный DOM-элемент
//     return node;
// };
//
// const patchProp = (node, key, value, nextValue) => {
//     // Если новое значение не задано, то удаляем атрибут
//     if (nextValue == null || nextValue === false) {
//         node.removeAttribute(key);
//         return;
//     }
//
//     // Устанавливаем новое значение атрибута
//     node.setAttribute(key, nextValue);
// };
//
// const patchProps = (node, props, nextProps) => {
//     // Объект с общими свойствами
//     const mergedProps = { ...props, ...nextProps };
//
//     Object.keys(mergedProps).forEach(key => {
//         // Если значение не изменилось, то ничего не обновляем
//         if (props[key] !== nextProps[key]) {
//             patchProp(node, key, props[key], nextProps[key]);
//         }
//     });
// };
// const patchChildren = (parent, vChildren, nextVChildren) => {
//     parent.childNodes.forEach((childNode, i) => {
//         patchNode(childNode, vChildren[i], nextVChildren[i]);
//     });
//
//     nextVChildren.slice(vChildren.length).forEach(vChild => {
//         parent.appendChild(createDOMNode(vChild));
//     });
// };