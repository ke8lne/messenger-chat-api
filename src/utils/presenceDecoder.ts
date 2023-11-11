export default function presenceDecode(j: string, str: string) {
     return decodeURIComponent(str.replace(/[_A-Z]/g, m => j[m]));
}