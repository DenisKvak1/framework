import {effect} from "../reactivity";
import {Ref} from "../../../env/type";

export function vModel(node:HTMLElement, bind: Ref<string | number | boolean>){
    if(node.tagName === "INPUT"){
        node.addEventListener('input', (e)=> {
            if((node as HTMLInputElement).type === "number"){
                bind.value = +(e.target as HTMLInputElement).value
            } else if((node as HTMLInputElement).type === "checkbox"){
                bind.value = Boolean((e.target as HTMLInputElement).checked)
            } else {
                bind.value = (e.target as HTMLInputElement).value
            }
        })

        effect(()=> {
            if((node as HTMLInputElement).type === "checkbox"){
                (node as HTMLInputElement).checked = bind.value as boolean
            } else {
                (node as HTMLInputElement).value = bind.value as string
            }
        })
    }
}