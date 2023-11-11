import padZeros from "./padZero";

export default function generateTimestampRelative() {
     let d = new Date();
     return d.getHours() + ":" + padZeros(d.getMinutes());
}