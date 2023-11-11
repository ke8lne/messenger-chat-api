export default function presenceEncode(h: string, i: string, str: string) {
     return encodeURIComponent(str)
          .replace(/([_A-Z])|%../g, (m, n) => n ? "%" + n.charCodeAt(0).toString(16) : m)
          .toLowerCase()
          .replace(h, m => i[m]);
}