import { currentComponentInstance } from '../../index';

export function emit(event: string, payload: any) {
    const parentComponent = currentComponentInstance.value.parentComponent
    const handlers = currentComponentInstance.value.handlers
    const props = parentComponent.props

    const expression = handlers[event]
    if(expression){
        const expressionFunction = new Function('dataObj', `with(dataObj) { return ${expression}; }`);
        expressionFunction(props)(payload)
    }
}