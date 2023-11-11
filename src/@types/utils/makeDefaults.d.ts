export default function makeDefaults(html: string, userID: string, ctx: Record<string, any>): {
    get: (url: any, jar: any, qs: any) => Promise<any>;
    post: (url: any, jar: any, form: any) => Promise<any>;
    postFormData: (url: any, jar: any, form: any, qs: any) => Promise<any>;
};
