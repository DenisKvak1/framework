import {currentComponentInstance} from "../component";

export const onUnMountedList:{[key: string]: Function[]} = {}

export const onUnMounted = (callback: ()=> void) => {
    const componentList = onUnMountedList[currentComponentInstance.value.name]
    if(componentList){
        componentList.push(callback)
    } else {
        onUnMountedList[currentComponentInstance.value.name] = [callback]
    }
}
