import {Ref} from "../../../env/type";
import {effect} from "../reactivity";

export function conditionalRender(condition: Ref<boolean>, component: HTMLElement) {
    const parent = component.parentElement;
    const placeholder = document.createComment("There is a component here");

    if (parent) {
        parent.replaceChild(placeholder, component);

        effect(() => {
            if (condition.value) {
                if (placeholder.parentElement) {
                    placeholder.parentElement.replaceChild(component, placeholder);
                }
            } else {
                if (component.parentElement) {
                    component.parentElement.replaceChild(placeholder, component);
                }
            }
        });
    }
}