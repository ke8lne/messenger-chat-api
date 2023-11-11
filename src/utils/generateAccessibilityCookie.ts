export default function generateAccessiblityCookie() {
     let time = Date.now();
     return encodeURIComponent(JSON.stringify({
          sr: 0,
          "sr-ts": time,
          jk: 0,
          "jk-ts": time,
          kb: 0,
          "kb-ts": time,
          hcm: 0,
          "hcm-ts": time
     }));
}