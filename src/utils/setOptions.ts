import Log from "npmlog";

export default function setOptions(globalOptions: ApiOptions, options: ApiOptions = {}) {
     Object.keys(options ?? globalOptions).map(function (key) {
          switch (key) {
               case 'logLevel':
                    Log.level = options.logLevel;
                    globalOptions.logLevel = options.logLevel;
                    break;
               case 'logRecordSize':
                    Log.maxRecordSize = options.logRecordSize;
                    globalOptions.logRecordSize = options.logRecordSize;
                    break;
               case 'selfListen':
                    globalOptions.selfListen = options.selfListen;
                    break;
               case 'listenEvents':
                    globalOptions.listenEvents = options.listenEvents;
                    break;
               case 'listenTyping':
                    globalOptions.listenTyping = options.listenTyping;
                    break;
               case 'pageID':
                    globalOptions.pageID = options.pageID.toString();
                    break;
               case 'updatePresence':
                    globalOptions.updatePresence = options.updatePresence;
                    break;
               case 'forceLogin':
                    globalOptions.forceLogin = options.forceLogin;
                    break;
               case 'userAgent':
                    globalOptions.userAgent = options.userAgent;
                    break;
               case 'autoMarkDelivery':
                    globalOptions.autoMarkDelivery = options.autoMarkDelivery;
                    break;
               case 'autoMarkRead':
                    globalOptions.autoMarkRead = options.autoMarkRead;
                    break;
               default:
                    Log.warn(__filename, "Unrecognized option given to setOptions: " + key);
                    break;
          }
     });
     return globalOptions;
}

export interface ApiOptions {
     /**
      * The desired logging level as determined by npmlog.
      */
     logLevel?: Log.LogLevels;
     /**
      * Set this to true if you want your api to receive messages from its own account. This is to be used with caution, as it can result in loops (a simple echo bot will send messages forever).
      * @default false
      */
     selfListen?: boolean;
     /**
      * Will make api.listen also handle events (look at api.listen for more details).
      * @default false
      */
     listenEvents?: boolean;
     /**
      * Will emit when user in a thread is typing.
      */
     listenTyping?: boolean;
     /**
      * Makes api.listen only receive messages through the page specified by that ID. Also makes sendMessage and sendSticker send from the page.
      */
     pageID?: string | number;
     /**
      * Will make api.listen also return presence (api.listen for more details).
      * @default false
      */
     updatePresence?: boolean;
     /**
      * Will automatically approve of any recent logins and continue with the login process.
      * @default false
      */
     forceLogin?: boolean;
     /**
      * The desired simulated User Agent.
      * @default Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/600.3.18 (KHTML, like Gecko) Version/8.0.3 Safari/600.3.18.
      */
     userAgent?: string;
     /**
      * Will automatically mark new messages as delivered. 
      * @default true
      */
     autoMarkDelivery?: boolean;
     /**
      * Will automatically mark new messages as read/seen. 
      * @default false
      */
     autoMarkRead?: boolean;
     logRecordSize?: number;
     autoReconnect?: boolean;
     online?: boolean;
     proxy?: string;
     agent?: string;
}