import { Api, Ctx, DefaultFuncs } from "../Interface";
import { ApiOptions } from "../utils/setOptions";
export declare enum UserGender {
    "unknown" = 0,
    "female_singular" = 1,
    "male_singular" = 2,
    "female_singular_guess" = 3,
    "male_singular_guess" = 4,
    "mixed" = 5,
    "neuter_singular" = 6,
    "unknown_singular" = 7,
    "female_plural" = 8,
    "male_plural" = 9,
    "neuter_plural" = 10,
    "unknown_plural" = 11
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
export default function (funcs: DefaultFuncs, api: Api, ctx: Ctx, options: ApiOptions): () => Promise<User[]>;
