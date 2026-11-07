import {convertArrayToObject} from "./array";

export const shallowEqual = (object1, object2) => {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);
    if (keys1.length !== keys2.length) {
        return false;
    }
    for (let key of keys1) {
        if (object1[key] !== object2[key]) {
            return false;
        }
    }
    return true;
}

export const deepSorting = (properties, object, fn) => {
    if (!properties.length) {
        return convertArrayToObject(Object.values(object).sort(fn), "id")
    }

    const prop = properties.shift();

    return convertArrayToObject(
        Object.values(object)
            .map((o: object) => ({...o, [prop]: deepSorting(properties, o[prop], fn)})),
        "id"
    )
}

export const objectToArray = (obj) => {
    return Object.values(obj).map(val => {
        const o = {};

        Object.keys(val).map(v => {
            if (typeof val[v] === "object") {
                o[v] = objectToArray(val[v])
            } else {
                o[v] = val[v]
            }
        })

        return o;
    })
}

export const deepFiltering = (properties, object, fn) => {
    if (!properties.length) return convertArrayToObject(Object.values(object).filter(a => fn(a)), "id");

    const prop = properties.shift();

    return convertArrayToObject(
        Object.values(object)
            .map((o: object) => ({...o, [prop]: deepFiltering(properties, o[prop], fn)}))
            .filter((o) => Object.keys(o[prop]).length),
        "id"
    )
}