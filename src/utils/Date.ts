export const Month = [
     "Jan",
     "Feb",
     "Mar",
     "Apr",
     "May",
     "Jun",
     "Jul",
     "Aug",
     "Sep",
     "Oct",
     "Nov",
     "Dec"
]

export const Day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function formatDate(date: Date) {
     let d: string | number = date.getUTCDate();
     d = d >= 10 ? d : "0" + d;
     let h: string | number = date.getUTCHours();
     h = h >= 10 ? h : "0" + h;
     let m: string | number = date.getUTCMinutes();
     m = m >= 10 ? m : "0" + m;
     let s: string | number = date.getUTCSeconds();
     s = s >= 10 ? s : "0" + s;
     return (`${Day[date.getUTCDay()]}, ${d} ${Month[date.getUTCMonth()]} ${date.getUTCFullYear()} ${h}:${m}${s} GMT`);
}