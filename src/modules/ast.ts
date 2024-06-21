import { HTMLTemplate, LexTree, VComponentNode, VNode } from '../../env/type';
import { isStandardDOMTag } from '../../env/helper/isStandartDOMTag';
import { directivesList } from './directives/directives';
import { ComponentInstance, Framework } from './framework';
const { v4: uuidv4 } = require('uuid');


export class AST {
    constructor(
      private controller: Framework
    ) {}
    lex(input: HTMLTemplate): LexTree {
        const tokens = [];
        let i = 0;
        while (i < input.length) {
            // Проверяем начало тега
            if (input[i] === '<') {
                // Проверяем закрывающий тег
                if (input[i + 1] === '/') {
                    i += 2;
                    let tagName = '';
                    // Считываем имя закрывающегося тега
                    while (input[i] !== '>') {
                        tagName += input[i];
                        i++;
                    }
                    tokens.push({ type: 'tag-end', value: tagName });
                    i++;
                } else {
                    i++;
                    let tagName = '';
                    // Считываем имя открывающегося тега
                    while (input[i] !== '>' && input[i] !== ' ') {
                        tagName += input[i];
                        i++;
                    }
                    tokens.push({ type: 'tag-start', value: tagName });

                    // Обрабатываем атрибуты тега
                    while (input[i] !== '>') {
                        if (input[i] === ' ') {
                            i++;
                            continue;
                        }

                        let attrName = '';
                        // Считываем имя атрибута
                        while (input[i] !== '=' && input[i] !== ' ') {
                            attrName += input[i];
                            i++;
                        }

                        i++; // Пропускаем '='
                        let attrValue = '';
                        // Считываем значение атрибута
                        if (input[i] === '"') {
                            i++;
                            while (input[i] !== '"') {
                                attrValue += input[i];
                                i++;
                            }
                            i++; // Пропускаем закрывающую кавычку '"'
                        }

                        // Определяем тип атрибута: привязка (bind), обработчик (handler) или обычный (prop)
                        if (attrName.startsWith(':')) {
                            tokens.push({ type: 'bind', name: attrName.slice(1), value: attrValue });
                        } else if (attrName.startsWith('@')) {
                            tokens.push({ type: 'handler', name: attrName.slice(1), value: attrValue });
                        } else {
                            tokens.push({ type: 'prop', name: attrName, value: attrValue });
                        }
                    }
                    i++; // Пропускаем '>'
                }
            } else if (input[i] === '{' && input[i + 1] === '{') {
                i += 2;
                let interpolation = '';
                // Считываем содержимое интерполяции
                while (input[i] !== '}' || input[i + 1] !== '}') {
                    interpolation += input[i];
                    i++;
                }
                i += 2; // Пропускаем закрывающую '}}'
                tokens.push({ type: 'interpolation', value: interpolation.trim() });
            } else {
                // Считываем текст между тегами
                let text = '';
                while (i < input.length && input[i] !== '<' && !(input[i] === '{' && input[i + 1] === '{')) {
                    text += input[i];
                    i++;
                }
                if (text.trim()) {
                    tokens.push({ type: 'text', value: text.trim() });
                }
            }
        }

        return tokens as LexTree;
    }
    parse(tokens: LexTree): VNode{
        const root = { type: 'root', children: [] } as VNode;
        const stack = [root];
        let current = root;

        for (const token of tokens) {
            if (token.type === 'tag-start') {
                let element = { type: "element", tagName: token.value, props: {}, directives:{}, binds: {}, handlers: {}, children: [] } as VNode
                if (!isStandardDOMTag(token.value)) {
                    element.type = 'component';
                    element.children = this.parse(this.lex(this.controller.components[token.value].template)).children;
                    element.style = this.controller.components[token.value].style
                }
                current.children.push(element);

                stack.push(element);
                current = element;
            } else if (token.type === 'tag-end') {
                stack.pop();
                current = stack[stack.length - 1];
            } else if (token.type === 'prop') {
                if(directivesList.includes(token.name)){
                    current.directives[token.name] = token.value
                } else {
                    current.props[token.name] = token.value;
                }
            } else if (token.type === 'bind') {
                current.binds[token.name] = token.value;
            } else if (token.type === 'handler') {
                current.handlers[token.name] = token.value;
            } else if (token.type === 'text') {
                current.children.push({ type: 'text', content: token.value });
            } else if (token.type === 'interpolation') {
                current.children.push({ type: 'interpolation', content: token.value });
            }
        }

        return root;
    }
    indexingParentComponents(node: VNode, parentComponent?: VNode, grandParentComponent?: VNode) {
        const newNode = { ...node };

        if (newNode.type === 'component') {
            grandParentComponent = parentComponent; // Обновляем "дедовский" компонент
            parentComponent = newNode; // Обновляем текущий родительский компонент
        }

        if (newNode.type === 'interpolation') {
            const pComponent = parentComponent.tagName === newNode.tagName ? grandParentComponent as VComponentNode: parentComponent as VComponentNode // TODO
            newNode.parentComponent = pComponent; // Привязываем интерполяцию к текущему родительскому компоненту
        }

        if (newNode.type === 'element' || newNode.type === 'component' ) {
            const pComponent = parentComponent.tagName === newNode.tagName ? grandParentComponent as VComponentNode : parentComponent as VComponentNode // TODO
            newNode.parentComponent = pComponent;
        }

        if (newNode.children) {
            // Рекурсивно обрабатываем детей, передавая текущий родительский и "дедовский" компоненты
            newNode.children = newNode.children.map(child => this.indexingParentComponents(child, parentComponent, grandParentComponent));
        }

        return newNode;
    }
    processPropsComponent(node:VNode, isFirstRoot = true, parentComponent?: VNode, grandParentComponent?: VNode):VNode {
        const newNode = { ...node }; // Создаем новый узел, копируя текущий

        // Обновляем grandParentComponent перед обновлением parentComponent
        if (newNode.type === 'component') {
            grandParentComponent = parentComponent;
            parentComponent = newNode;
        }

        // Если у узла есть binds, то ищем информацию в props у дедушкиного компонента
        if (newNode.binds && grandParentComponent && grandParentComponent.props && newNode.type === "component") {
            newNode.props = newNode.props || {};
            for (const [key, bindKey] of Object.entries(newNode.binds)) {
                if (typeof bindKey === 'string' && bindKey.startsWith("'") && bindKey.endsWith("'")) {
                    // Убираем кавычки и присваиваем значение напрямую
                    newNode.props[key] = bindKey.slice(1, -1);
                } else if (grandParentComponent.props.hasOwnProperty(bindKey)) {
                    if(grandParentComponent.props[bindKey as string]){
                        newNode.props[key] = grandParentComponent.props[bindKey as string];
                    }
                }
            }
            delete newNode.binds;
        }


        // Если узел является компонентом и не первым рутовым, обрабатываем его пропсы
        if (!isFirstRoot && newNode.type === 'component' && this.controller.components[newNode.tagName]) {
            ComponentInstance.value = {
                uid: uuidv4(),
                ...this.controller.components[newNode.tagName],
                onMounted: [],
                unUnMounted: [],
            }
            newNode.props = this.controller.components[newNode.tagName].setup(newNode.props);
        }

        // Рекурсивно проходим по детям узла
        if (newNode.children) {
            newNode.children = newNode.children.map(child =>
              this.processPropsComponent(child, false, parentComponent, grandParentComponent)
            );
        }

        return newNode;
    }
}

// export function lex(input: HTMLTemplate): LexTree {
//     const tokens = [];
//     let i = 0;
//     while (i < input.length) {
//         // Проверяем начало тега
//         if (input[i] === '<') {
//             // Проверяем закрывающий тег
//             if (input[i + 1] === '/') {
//                 i += 2;
//                 let tagName = '';
//                 // Считываем имя закрывающегося тега
//                 while (input[i] !== '>') {
//                     tagName += input[i];
//                     i++;
//                 }
//                 tokens.push({ type: 'tag-end', value: tagName });
//                 i++;
//             } else {
//                 i++;
//                 let tagName = '';
//                 // Считываем имя открывающегося тега
//                 while (input[i] !== '>' && input[i] !== ' ') {
//                     tagName += input[i];
//                     i++;
//                 }
//                 tokens.push({ type: 'tag-start', value: tagName });
//
//                 // Обрабатываем атрибуты тега
//                 while (input[i] !== '>') {
//                     if (input[i] === ' ') {
//                         i++;
//                         continue;
//                     }
//
//                     let attrName = '';
//                     // Считываем имя атрибута
//                     while (input[i] !== '=' && input[i] !== ' ') {
//                         attrName += input[i];
//                         i++;
//                     }
//
//                     i++; // Пропускаем '='
//                     let attrValue = '';
//                     // Считываем значение атрибута
//                     if (input[i] === '"') {
//                         i++;
//                         while (input[i] !== '"') {
//                             attrValue += input[i];
//                             i++;
//                         }
//                         i++; // Пропускаем закрывающую кавычку '"'
//                     }
//
//                     // Определяем тип атрибута: привязка (bind), обработчик (handler) или обычный (prop)
//                     if (attrName.startsWith(':')) {
//                         tokens.push({ type: 'bind', name: attrName.slice(1), value: attrValue });
//                     } else if (attrName.startsWith('@')) {
//                         tokens.push({ type: 'handler', name: attrName.slice(1), value: attrValue });
//                     } else {
//                         tokens.push({ type: 'prop', name: attrName, value: attrValue });
//                     }
//                 }
//                 i++; // Пропускаем '>'
//             }
//         } else if (input[i] === '{' && input[i + 1] === '{') {
//             i += 2;
//             let interpolation = '';
//             // Считываем содержимое интерполяции
//             while (input[i] !== '}' || input[i + 1] !== '}') {
//                 interpolation += input[i];
//                 i++;
//             }
//             i += 2; // Пропускаем закрывающую '}}'
//             tokens.push({ type: 'interpolation', value: interpolation.trim() });
//         } else {
//             // Считываем текст между тегами
//             let text = '';
//             while (i < input.length && input[i] !== '<' && !(input[i] === '{' && input[i + 1] === '{')) {
//                 text += input[i];
//                 i++;
//             }
//             if (text.trim()) {
//                 tokens.push({ type: 'text', value: text.trim() });
//             }
//         }
//     }
//
//     return tokens as LexTree;
// }
// export function parse(tokens: LexTree, components: CustomComponents): VNode{
//     const root = { type: 'root', children: [] } as VNode;
//     const stack = [root];
//     let current = root;
//
//     for (const token of tokens) {
//         if (token.type === 'tag-start') {
//             let element = { type: "element", tagName: token.value, props: {}, directives:{}, binds: {}, handlers: {}, children: [] } as VNode
//             if (!isStandardDOMTag(token.value)) {
//                 element.type = 'component';
//                 element.children = parse(lex(components[token.value].template), components).children;
//                 element.style = components[token.value].style
//             }
//             current.children.push(element);
//
//             stack.push(element);
//             current = element;
//         } else if (token.type === 'tag-end') {
//             stack.pop();
//             current = stack[stack.length - 1];
//         } else if (token.type === 'prop') {
//             if(directivesList.includes(token.name)){
//                 current.directives[token.name] = token.value
//             } else {
//                 current.props[token.name] = token.value;
//             }
//         } else if (token.type === 'bind') {
//             current.binds[token.name] = token.value;
//         } else if (token.type === 'handler') {
//             current.handlers[token.name] = token.value;
//         } else if (token.type === 'text') {
//             current.children.push({ type: 'text', content: token.value });
//         } else if (token.type === 'interpolation') {
//             current.children.push({ type: 'interpolation', content: token.value });
//         }
//     }
//
//     return root;
// }
//
// export function indexingParentComponents(node: VNode, parentComponent?: VNode, grandParentComponent?: VNode) {
//     const newNode = { ...node };
//
//     if (newNode.type === 'component') {
//         grandParentComponent = parentComponent; // Обновляем "дедовский" компонент
//         parentComponent = newNode; // Обновляем текущий родительский компонент
//     }
//
//     if (newNode.type === 'interpolation') {
//         const pComponent = parentComponent.tagName === newNode.tagName ? grandParentComponent as VComponentNode: parentComponent as VComponentNode // TODO
//         newNode.parentComponent = pComponent; // Привязываем интерполяцию к текущему родительскому компоненту
//     }
//
//     if (newNode.type === 'element' || newNode.type === 'component' ) {
//         const pComponent = parentComponent.tagName === newNode.tagName ? grandParentComponent as VComponentNode : parentComponent as VComponentNode // TODO
//         newNode.parentComponent = pComponent;
//     }
//
//     if (newNode.children) {
//         // Рекурсивно обрабатываем детей, передавая текущий родительский и "дедовский" компоненты
//         newNode.children = newNode.children.map(child => indexingParentComponents(child, parentComponent, grandParentComponent));
//     }
//
//     return newNode;
// }
// export function processPropsComponent(node:VNode, components:CustomComponents, isFirstRoot = true, parentComponent?: VNode, grandParentComponent?: VNode):VNode {
//     const newNode = { ...node }; // Создаем новый узел, копируя текущий
//
//     // Обновляем grandParentComponent перед обновлением parentComponent
//     if (newNode.type === 'component') {
//         grandParentComponent = parentComponent;
//         parentComponent = newNode;
//     }
//
//     // Если у узла есть binds, то ищем информацию в props у дедушкиного компонента
//     if (newNode.binds && grandParentComponent && grandParentComponent.props && newNode.type === "component") {
//         newNode.props = newNode.props || {};
//         console.log(newNode.props, newNode)
//         for (const [key, bindKey] of Object.entries(newNode.binds)) {
//             if (typeof bindKey === 'string' && bindKey.startsWith("'") && bindKey.endsWith("'")) {
//                 // Убираем кавычки и присваиваем значение напрямую
//                 newNode.props[key] = bindKey.slice(1, -1);
//             } else if (grandParentComponent.props.hasOwnProperty(bindKey)) {
//                 if(grandParentComponent.props[bindKey as string]){
//                     newNode.props[key] = grandParentComponent.props[bindKey as string];
//                 }
//             }
//         }
//         delete newNode.binds;
//     }
//
//
//     // Если узел является компонентом и не первым рутовым, обрабатываем его пропсы
//     if (!isFirstRoot && newNode.type === 'component' && components[newNode.tagName]) {
//         currentComponentInstance.value = components[newNode.tagName]
//         newNode.props = components[newNode.tagName].setup(newNode.props);
//     }
//
//     // Рекурсивно проходим по детям узла
//     if (newNode.children) {
//         newNode.children = newNode.children.map(child =>
//             processPropsComponent(child, components, false, parentComponent, grandParentComponent)
//         );
//     }
//
//     return newNode;
// }