import {effect} from "../../src/modules/reactivity";
import {Ref} from "../type";

export function bindClassEffect(node: HTMLElement, className: string, bind: { value: boolean }) {
    effect(() => {
        if (bind.value) {
            node.classList.add(className);
        } else {
            node.classList.remove(className);
        }
    });
}
export function parseStringToObject(str: string): { [key: string]: string } {
    // Убираем фигурные скобки
    str = str.trim();
    if (str.startsWith('{') && str.endsWith('}')) {
        str = str.slice(1, -1);
    } else {
        throw new Error('Invalid input string format');
    }

    // Разбиваем строку на пары ключ-значение
    const pairs = str.split(',');

    // Создаем объект для хранения результатов
    const result: { [key: string]: string } = {};

    // Разбираем пары ключ-значение и добавляем их в объект
    pairs.forEach(pair => {
        const [key, value] = pair.split(':');
        if (key && value) {
            result[key.trim()] = value.trim();
        } else {
            throw new Error('Invalid key-value pair format');
        }
    });

    return result;
}
export function parseExpression(expression: string, refs: Record<string, Ref<any>>): string {
    const regex = /([a-zA-Z_$][0-9a-zA-Z_$]*)/g;
    return expression.replace(regex, (match, varName) => {
        if (refs[varName]) {
            return `${varName}.value`;
        }
        return match;
    });
}
