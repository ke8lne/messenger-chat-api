export default function makeParsable(html: string) {
     let withoutForLoop = html.replace(/for\s*\(\s*;\s*;\s*\)\s*;\s*/, "");
     // (What the fuck FB, why windows style newlines?)
     // So sometimes FB will send us base multiple objects in the same response.
     // They're all valid JSON, one after the other, at the top level. We detect
     // that and make it parse-able by JSON.parse.
     //       Ben - July 15th 2017
     //
     // It turns out that Facebook may insert random number of spaces before
     // next object begins (issue #616)
     //       rav_kr - 2018-03-19
     let maybeMultipleObjects = withoutForLoop.split(/\}\r\n *\{/);
     if (maybeMultipleObjects.length === 1) return maybeMultipleObjects;
     return "[" + maybeMultipleObjects.join("},{") + "]";
}