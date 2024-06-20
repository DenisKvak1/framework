import {currentComponentInstance} from "../component";

export const onMountedList:{[key: string]: Function[]} = {}

export const onMounted = (callback: ()=> void) => {
    const componentList = onMountedList[currentComponentInstance.value.name]
    if(componentList){
        componentList.push(callback)
    } else {
        onMountedList[currentComponentInstance.value.name] = [callback]
    }
}
