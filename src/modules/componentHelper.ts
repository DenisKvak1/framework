import { CustomComponent, VComponentNode, VNodeComponentProps } from '../../env/type';
import { v4 as uuidv4 } from 'uuid';
import { currentComponentInstance } from '../index';
import { Framework } from './framework';

export class ComponentHelper {
    constructor(
        private controller: Framework
    ) {}
    createComponentInstance(component: CustomComponent<any, any>, props?: VNodeComponentProps){
        const children = this.controller.ASTHelper.parse(this.controller.ASTHelper.lex(component.template)).children
        const componentInstance = {
            uid: uuidv4(),
            type: "component",
            tagName: component.name,
            binds: {},
            props: {},
            directives: {},
            lifeCycles: {
                mounted: [],
                unMounted: []
            },
            children: children || [],
            style: component.style,
            handlers: {},
        } as VComponentNode;
        currentComponentInstance.value = componentInstance
        componentInstance.props = component.setup(props)
        const indexingProps = this.controller.ASTHelper.processPropsComponent(componentInstance)
        const indexingComponent = this.controller.ASTHelper.indexingParentComponents(indexingProps) as VComponentNode
        return indexingComponent
    }
}