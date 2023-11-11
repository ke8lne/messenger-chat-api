export default function padZeros(value: number | string, length?: number) {
     value = String(value);
     length = length || 2;
     while (value.length < length) value = "0" + value;
     return value;
}