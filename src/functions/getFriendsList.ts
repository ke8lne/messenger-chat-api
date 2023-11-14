import parseAndCheckLogin from "../utils/parseCheckAndLogin";
import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
import { formatID } from "../utils/format";
import Log from "npmlog"

export enum UserGender {
  "unknown",
  "female_singular",
  "male_singular",
  "female_singular_guess",
  "male_singular_guess",
  "mixed",
  "neuter_singular",
  "unknown_singular",
  "female_plural",
  "male_plural",
  "neuter_plural",
  "unknown_plural"
}

export type UserType = string;

export interface UserRaw {
  alternateName: string | null;
  firstName: string;
  gender: number;
  id: string;
  is_friend: boolean | null;
  name: string;
  thumbSrc: string;
  type: string;
  uri: string;
  vanity: string;
  is_birthday: boolean;
}

export interface User {
  userID: string;
  alternateName: string;
  firstName: string;
  gender: UserGender;
  isFriend: boolean;
  fullName: string;
  profilePicture: string;
  type: UserType;
  profileUrl: string;
  vanity: string;
  isBirthday: boolean;
}

function formatData(obj: Record<string, any>) {
  return Object.keys(obj).map(key => {
    const user: UserRaw = obj[key];
    return {
      alternateName: user.alternateName || undefined,
      firstName: user.firstName,
      gender: UserGender[user.gender],
      userID: formatID(user.id.toString()),
      isFriend: user.is_friend != null && user.is_friend,
      fullName: user.name,
      profilePicture: user.thumbSrc,
      type: user.type,
      profileUrl: user.uri,
      vanity: user.vanity,
      isBirthday: !!user.is_birthday
    } as unknown as User;
  })
}

export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions) {
  /**
   * Returns an array of objects with user info currenly logged user's friend list.
   * @returns {User}
   */
  return async function getFriendsList(): Promise<User[]> {
    return await funcs.postFormData("https://www.facebook.com/chat/user_info_all", ctx.jar, {}, { viewer: ctx.userID }, options)
      .then(parseAndCheckLogin(ctx, funcs))
      .then(res => {
        if (!res) throw { error: "getFriendsList returned empty object." };
        if (res.error) throw res.error;
        return formatData(res.payload);
      })
      .catch(err => {
        Log.error("getFriendsList", err);
        throw err;
      })
  }
}