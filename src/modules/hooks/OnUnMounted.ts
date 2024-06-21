import { ComponentInstance } from '../framework';

export const onUnMounted = (callback: ()=> void) => {
    ComponentInstance.value['unUnMounted'].push(callback)
}