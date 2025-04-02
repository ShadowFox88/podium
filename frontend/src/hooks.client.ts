import * as Sentry from "@sentry/sveltekit";
import type { ServerInit } from "@sveltejs/kit";
import { client } from "$lib/client/sdk.gen";
import { user, validateToken } from "$lib/user.svelte";
// @ts-ignore
import { PUBLIC_API_URL } from "$env/static/public";

// If you don't want to use Session Replay, remove the `Replay` integration,
// `replaysSessionSampleRate` and `replaysOnErrorSampleRate` options.
Sentry.init({
    dsn: "https://489f4a109d07aeadfd13387bcd3197ab@o4508979744210944.ingest.de.sentry.io/4508979747553360",
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    integrations: [Sentry.replayIntegration(
      {
        maskAllText: false,
      }
    )],
    sendDefaultPii: false,
})

client.setConfig({
  baseUrl: PUBLIC_API_URL,
  headers: {
    Authorization: `Bearer ${user.token}`,
  },
  // Instead of returning an error, throw an exception that can be caught with try/catch
  // This can be overridden by passing throwOnError.
  throwOnError: true,
});
export const init: ServerInit = async () => {
  if (user.isAuthenticated) {
    console.debug("User is already authenticated, checking token");
    await validateToken(user.token);
    console.log("Finished auth");
  } else {
    const token = localStorage.getItem("token");
    if (token) {
      console.debug("Token found in localStorage", token);
      await validateToken(token);
      console.log("Finished auth");
    } else {
      console.debug("No token found in localStorage");
    }
    // console.debug('User token: ', user.token);
    // console.debug('Client config: ', client.getConfig());
  }
};
export const handleError = Sentry.handleErrorWithSentry();