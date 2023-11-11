export default function arrToForm(form) {
     return arrayToObject(form, v => v.name, v => v.val);
}

export function arrayToObject(arr: Record<string, any>[], getKey: (val: Record<string, any>) => any, getValue: (val: Record<string, any>) => any) {
     return arr.reduce((acc, val) => {
          acc[getKey(val)] = getValue(val);
          return acc;
     }, {});
}