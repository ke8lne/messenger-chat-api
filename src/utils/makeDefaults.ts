import postFormData from "./postFormData";
import getFrom from "./getForm";
import post from "./post";
import get from "./get";

export default function makeDefaults(html: string, userID: string, ctx: Record<string, any>) {
     let reqCounter = 1, fb_dtsg = getFrom(html, 'name="fb_dtsg" value="', '"'), ttstamp = "2";
     for (let i = 0; i < fb_dtsg.length; i++)
          ttstamp += fb_dtsg.charCodeAt(i);
     let revision = getFrom(html, 'revision":', ",");
     function mergeWithDefaults(obj: Record<string, any>) {
          let newObj = {
               __user: userID,
               __req: (reqCounter++).toString(36),
               __rev: revision,
               __a: 1,
               fb_dtsg: ctx.fb_dtsg ? ctx.fb_dtsg : fb_dtsg,
               jazoest: ctx.ttstamp ? ctx.ttstamp : ttstamp
          };
          if (!obj) return newObj;
          for (let prop in obj)
               if (obj.hasOwnProperty(prop))
                    if (!newObj[prop])
                         newObj[prop] = obj[prop];
          return newObj;
     }
     return {
          get: (url, jar, qs) => get(url, jar, mergeWithDefaults(qs), ctx.globalOptions),
          post: (url, jar, form) => post(url, jar, mergeWithDefaults(form), ctx.globalOptions),
          postFormData: (url, jar, form, qs) => postFormData(url, jar, mergeWithDefaults(form), mergeWithDefaults(qs), ctx.globalOptions)
     };
}