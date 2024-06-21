import { ComponentInstance } from '../framework';


export const onMounted = (callback: ()=> void) => {
    ComponentInstance.value['onMounted'].push(callback)
}
