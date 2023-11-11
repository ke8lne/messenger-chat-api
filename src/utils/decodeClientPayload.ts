export default function decodeClientPayload(payload: string) {
     return JSON.parse(String.fromCharCode.apply(null, payload));
}