export default function getGUID() {
     let sectionLength = Date.now();
     let id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
          let r = Math.floor((sectionLength + Math.random() * 16) % 16);
          sectionLength = Math.floor(sectionLength / 16);
          let _guid = (c == "x" ? r : (r & 7) | 8).toString(16);
          return _guid;
     });
     return id;
}