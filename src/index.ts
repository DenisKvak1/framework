import { ref } from './modules/reactivity';
import { CustomComponent, Ref, VComponentNode } from '../env/type';
import { Framework } from './modules/framework';

export const currentComponentInstance: {value: VComponentNode} = {value: null}

const appComponent: CustomComponent<null, {
    name: Ref<string>
}> = {
    name: 'app',
    template: `
        <HelloWorld :name="name"></HelloWorld>
        <input v-model="inputData" placeholder="Сохранить имя"></input>
        <button @click="saveData">Сохранить</button>
`   ,
    setup() {
        const inputData = ref('');
        const name = ref("denis")
        function saveData(){
            if(!inputData.value) return
            name.value = inputData.value;
            inputData.value = ''
        }

        return {
            inputData,
            name,
            saveData
        }
    },
    style: `
        button {
            cursor: pointer;
            margin: 5px;  
            border: none;
            padding: 5px 10px;
            border-radius: 5px;
            background: rgb(232 91 91);
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
        <div style="background: #e9ffd9">
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
            background: rgb(213 213 213);;
        }   
    `
}
const components = {
    HelloWorld: helloWorldComponent,
}
const app = new Framework(appComponent, components)
app.mount('#app')
