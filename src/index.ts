import {ref} from "./modules/reactivity";
import {CustomComponent, Ref} from "../env/type";
import { Framework } from './modules/framework';

const appComponent: CustomComponent<null, {
    name: Ref<string>
    name2: Ref<string>
}> = {
    name: 'app',
    template: `
        <HelloWorld :name="name"></HelloWorld>
        <button @click="()=> name.value = 'petya'">тест</button>
`   ,
    setup() {
        const name = ref("denis")
        const name2 = ref('haha')

        return {
            name,
            name2
        }
    },
    style: `
        button {
            background: blue;
        }
    `
}
const helloWorldComponent: CustomComponent<{name: Ref<string>}, {
    is: Ref<boolean>,
    value: Ref<number>,
    name: Ref<string>,
}> = {
    name: 'HelloWorld',
    template: `
        <div>
            <div>{{name}}</div>
            <div v-if="value !== 5" :class="{
               denis: value === 2,
               hanasy: value === 1
            }">{{ !is }}</div>
            <div>{{value}}</div>
            <button @click="()=> value.value = value.value +1 ">Инкримент</button>
            <button @click="()=> value.value = value.value -1 ">Декримент</button>
            <input type="checkbox" v-model="is"></input>
        </div>`,
    setup(props) {
        const {name} = props
        const is = ref(true)
        const value = ref(1);

        return {
            name,
            value,
            is
        }
    },
    style: `
        button {
            cursor: pointer;
            margin: 5px;
            background: rgb(213 213 213);;
            border: none;
            padding: 5px 10px;
            border-radius: 5px;
        }   
    `
}
const components = {
    HelloWorld: helloWorldComponent,
}
const app = new Framework(appComponent, components)
app.mount('#app')
setTimeout(()=> app.unMount(), 10000)
