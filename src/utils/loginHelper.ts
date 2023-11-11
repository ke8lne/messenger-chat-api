import generateAccessiblityCookie from "./generateAccessibilityCookie";
import generatePresence from "./generatePresenece";
import { ApiOptions } from "./setOptions";
import { LoginData } from "../Interface";
import { saveCookies } from "./cookies";
import makeLogin from "./makeLogin";
import buildAPI from "./buildAPI";
import getFrom from "./getForm";
import request from "request";
import Log from "npmlog";
import get from "./get";

export default async function loginHelper({ H, I, J }, loginData: LoginData, globalOptions: ApiOptions) {
	let mainPromise = null, jar = request.jar();
	if (loginData.appState) {
		loginData.appState.map(c => {
			let str = `${c.key}=${c.value}; expires=${c.expires}; domain=${c.domain}; path=${c.path};`;
			jar.setCookie(str, "http://" + c.domain);
		});
		mainPromise = get('https://www.facebook.com/', jar, null, globalOptions).then(saveCookies(jar));
	}
	else
		mainPromise = get("https://www.facebook.com/", null, null, globalOptions).then(saveCookies(jar))
			.then((await makeLogin({ H, I, J }, jar, { email: loginData.email, password: loginData.password }, globalOptions)))
			.then(async () => await get('https://www.facebook.com/', jar, null, globalOptions).then(saveCookies(jar)));

	let apiBuilder: ReturnType<typeof buildAPI>;
	mainPromise = mainPromise.then(res => {
		// Hacky check for the redirection that happens on some ISPs, which doesn't return statusCode 3xx
		let reg = /<meta http-equiv="refresh" content="0;url=([^"]+)[^>]+>/, redirect = reg.exec(res.body);
		if (redirect && redirect[1])
			return get(redirect[1], jar, null, globalOptions).then(saveCookies(jar));
		return res;
	}).then(res => {
		let html = res.body;
		apiBuilder = buildAPI(globalOptions, html, jar);
		return res;
	}).then(() => {
		let form = { reason: 6 };
		Log.info(__filename, 'Request to reconnect');
		return apiBuilder.functions.get("https://www.facebook.com/ajax/presence/reconnect.php", apiBuilder.ctx.jar, form).then(saveCookies(apiBuilder.ctx.jar));
	}).then(() => {
		let presence = generatePresence(H, I, apiBuilder.ctx.userID);
		apiBuilder.ctx.jar.setCookie("presence=" + presence + "; path=/; domain=.facebook.com; secure", "https://www.facebook.com");
		apiBuilder.ctx.jar.setCookie("presence=" + presence + "; path=/; domain=.messenger.com; secure", "https://www.messenger.com");
		apiBuilder.ctx.jar.setCookie("locale=en_US; path=/; domain=.facebook.com; secure", "https://www.facebook.com");
		apiBuilder.ctx.jar.setCookie("locale=en_US; path=/; domain=.messenger.com; secure", "https://www.messenger.com");
		apiBuilder.ctx.jar.setCookie("a11y=" + generateAccessiblityCookie() + "; path=/; domain=.facebook.com; secure", "https://www.facebook.com");
		return true;
	});

	if (globalOptions.pageID)
		mainPromise = mainPromise.then(() => get('https://www.facebook.com/' + apiBuilder.ctx.globalOptions.pageID + '/messages/?section=messages&subsection=inbox', apiBuilder.ctx.jar, null, globalOptions))
			.then(async resData => {
				var url = getFrom(resData.body, 'window.location.replace("https:\\/\\/www.facebook.com\\', '");').split('\\').join('');
				url = url.substring(0, url.length - 1);
				return await get('https://www.facebook.com' + url, apiBuilder.ctx.jar, null, globalOptions);
			});
	return await mainPromise.then(() => {
		Log.info(__filename, 'Logged in.');
		return apiBuilder;
	}).catch(e => {
		Log.error(__filename, e.error || e);
		throw e;
	});
}