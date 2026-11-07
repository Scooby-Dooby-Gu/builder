export const deepFilteringArray = (properties, array, fn) => {
    if (!properties.length) return array.filter(a => fn(a));

    const prop = properties.shift();

    const b = array.map(o => ({...o, [prop]: deepFilteringArray(properties, o[prop], fn)}))

    return b.filter((o) => Object.keys(o[prop]).length)
}

export const convertArrayToObject = (array, key) => {
    return array.reduce((obj, item) => ({...obj, [item[key]]: item}), {});
};

export const arrayToObject = (array) => {
    const obj = {};

    array.map(item => {
        Object.keys(item).map(k => {
            if (Array.isArray(item[k])) {
                item[k] = arrayToObject(item[k])
            }
        })

        obj[item.id] = item;
    })

    return obj;
}

export const deepSortingArray = (properties, array, fn, extraProp) => {
    if (!properties.length) {
        return array.sort(fn)
    }

    const prop = properties.shift();

    return array.map(o => {
        const s = deepSortingArray(properties, o[prop], fn, extraProp);
        return ({...o, [prop]: s, [extraProp]: s[0][extraProp]})
    }).sort(fn)
}