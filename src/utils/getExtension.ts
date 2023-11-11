export default function getExtension(original_extension: string, filename = "") {
     if (original_extension)
          return original_extension;
     else {
          const extension = filename.split(".").pop();
          if (extension === filename) return "";
          else return extension;
     }
}