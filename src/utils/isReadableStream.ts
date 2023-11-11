import getType from "./getType";
import stream from "stream";

export default function isReadableStream(obj: any): obj is ReadableStream {
     return (obj instanceof stream.Stream && (getType((obj as any)._read) === "Function" || getType((obj as any)._read) === "AsyncFunction") && getType((obj as any)._readableState) === "Object")
}