import { formatID } from "./format";

export default function (data: Record<string, any>) {
     return {
          userID: formatID(data.uid.toString()),
          photoUrl: data.photo,
          indexRank: data.index_rank,
          name: data.text,
          isVerified: data.is_verified,
          profileUrl: data.path,
          category: data.category,
          score: data.score,
          type: data.type
     }
}

export function parseUserData(data: Record<string, any>) {
     const _obj = {};
     data.forEach(prop => {
          if (data.hasOwnProperty(prop)) {
               let innerObj = data[prop];
               _obj[prop] = {
                    name: innerObj.name,
                    firstName: innerObj.firstName,
                    vanity: innerObj.vanity,
                    thumbSrc: innerObj.thumbSrc,
                    profileUrl: innerObj.uri,
                    gender: innerObj.gender,
                    type: innerObj.type,
                    isFriend: innerObj.is_friend,
                    isBirthday: !!innerObj.is_birthday,
                    searchTokens: innerObj.searchTokens,
                    alternateName: innerObj.alternateName,
               }
          }
     });
     return _obj;
}