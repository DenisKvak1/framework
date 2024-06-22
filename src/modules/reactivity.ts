import { Effect, ReactiveHandler, Ref, TargetMap } from '../../env/type';

const targetMap: TargetMap = new WeakMap();
let activeEffect: Effect | null = null;

function track(target: object, key: PropertyKey): void {
    if (activeEffect) {
        let depsMap = targetMap.get(target);
        if (!depsMap) {
            depsMap = new Map<PropertyKey, Set<Effect>>();
            targetMap.set(target, depsMap);
        }
        let dep = depsMap.get(key);
        if (!dep) {
            dep = new Set<Effect>();
            depsMap.set(key, dep);
        }
        dep.add(activeEffect);
    }
}

function trigger(target: object, key: PropertyKey): void {
    const depsMap = targetMap.get(target);
    if (!depsMap) {
        return;
    }
    const dep = depsMap.get(key);
    if (dep) {
        dep.forEach(effect => {
            effect();
        });
    }
}

export function reactive<T extends object>(target: T): T {
    const handler: ReactiveHandler<T> = {
        get(target, key, receiver) {
            const result = Reflect.get(target, key, receiver);
            track(target, key);
            return result;
        },
        set(target, key, value, receiver) {
            const oldValue = target[key as keyof T];  // Уточнение типа здесь
            const result = Reflect.set(target, key, value, receiver);
            if (result && oldValue !== value) {
                trigger(target, key);
            }
            return result;
        },
    };
    return new Proxy(target, handler);
}

export function effect(eff: Effect): void {
    activeEffect = eff;
    activeEffect();
    activeEffect = null;
}

export function watch(eff: Effect): void {
    activeEffect = eff;
    activeEffect = null;
}

export function ref<T>(raw: T): Ref<T> {
    const ref: Ref<T> = {
        get value() {
            track(ref, 'value');
            return raw;
        },
        set value(newVal) {
            raw = newVal;
            trigger(ref, 'value');
        },
        toString() {
            track(ref, 'value');
            return raw.toString();
        },
        valueOf() {
            track(ref, 'value');
            return raw;
        },
        __isRef: true,
    };
    return ref;
}

export function computed<T>(getter: () => T): Ref<T> {
    const result = ref<T>(undefined as any); // Используем 'any' для первоначального undefined значения
    effect(() => {
        result.value = getter();
    });
    return result;
}
export function isRefObject(obj: any): obj is { __isReactive: boolean } {
    return obj && typeof obj === 'object' && '__isRef' in obj && obj.__isRef === true;
}
