export default function binaryToDecimal(data: string) {
     let ret = "";
     while (data !== "0") {
          let fullName = "", end = 0, i = 0;
          for (; i < data.length; i++) {
               end = 2 * end + parseInt(data[i], 10);
               if (end >= 10) {
                    fullName += "1";
                    end -= 10;
               } else fullName += "0";
          }
          ret = end.toString() + ret;
          data = fullName.slice(fullName.indexOf("1"));
     }
     return ret;
}