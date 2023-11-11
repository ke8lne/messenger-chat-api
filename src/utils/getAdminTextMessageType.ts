export default function getAdminTextMessageType(type: string) {
     switch (type) {
          case "change_thread_theme":
               return "log:thread-color";
          case "change_thread_nickname":
               return "log:user-nickname";
          case "change_thread_icon":
               return "log:thread-icon";
          default:
               return type;
     }
}