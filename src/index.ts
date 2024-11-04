import { reactive, ref } from './modules/reactivity';
import { CustomComponent, Ref, VComponentNode } from '../env/type';
import { Framework } from './modules/framework';
import { emit } from './modules/hooks/emit';

export const currentComponentInstance: {value: VComponentNode} = {value: null}

const appComponent: CustomComponent<null, {
    name: Ref<string>
}> = {
    name: 'app',
    template: `
        <div    style="border: #ac04ff 1px solid">
            <HelloWorld :name="name"></HelloWorld>
            <My-Form :inputPlaceholder="'Имя'" @submit="(data)=> name.value = data"></My-Form>
        </div>
`   ,
    setup() {
        const name = ref("denis")
        setTimeout(()=> name.value = "p", 3000)

        return {
            name,
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
        <div style="border: #62ef00 2px solid; width: 90%; margin-left: auto; margin-right: auto;">
            {{name}} <br></br>
            {{!store.name}}
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
        const store = reactive({
            name: true
        })
        setTimeout(()=> emit('event', {value: 'helloworld'}), 2000)

        setTimeout(()=> store.name = false, 1000)
        return {
            store,
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
const MyForm: CustomComponent<{
    inputPlaceholder: Ref<string>,
}, {

}> = {
    name: 'My-Form',
    template: `
        <div style="border: #1575e0 2px solid; width: 90%; margin-left: auto; margin-right: auto;">
            <input :placeholder="inputPlaceholder" v-model="inputValue" type="text"></input>
            <button @click="processData">Submit</button>
        </div>`,
    setup(props) {
        let {inputPlaceholder} = props
        if(!inputPlaceholder){
            inputPlaceholder = ref('Placeholder')
        }

        const inputValue = ref('');
        const processData = ()=>{
            if(inputValue.value){
                emit('submit', inputValue.value)
                inputValue.value = ''
            }
        }

        return {
            inputPlaceholder,
            inputValue,
            processData
        }
    },
    style: `
        input {
            border: 1px black solid;
            border-radius: 5px;
            height: 20px
        }
        button {
            background: rgb(213 213 213);;
        }   
    `
}

const components = {
    HelloWorld: helloWorldComponent,
    "My-Form": MyForm
}
const app = new Framework(appComponent, components)
app.mount('#app')
