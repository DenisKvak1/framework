import { currentComponentInstance } from '../../index';
import { LifeCycle, VNode } from '../../../env/type';

export function useLifeCyclesHook(callback: Function, lifeCycle: LifeCycle){
    currentComponentInstance.value.lifeCycles[lifeCycle].push(callback)
}

export const callLifeCycle = (node: VNode, lifeCycle: LifeCycle)=>{
    if(node.type === "component"){
        node.lifeCycles[lifeCycle].forEach((fn)=>fn())
    }

    if (node.children) {
        node.children.forEach(child => {
            callLifeCycle(child, lifeCycle);
        });
    }
}

export const onMounted = (callback:Function)=> useLifeCyclesHook(callback, LifeCycle.MOUNTED)
export const onUnMounted = (callback:Function) => useLifeCyclesHook(callback, LifeCycle.UNMOUNTED)
