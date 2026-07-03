// worker/index.js
//
// Cloudflare Worker entry point for the Workers-with-static-assets model
// (see wrangler.jsonc: main + assets.run_worker_first: true).
// Runs on every request, before any static asset is served, so it can gate
// the entire site behind a coming-soon page for everyone except a bypass
// cookie holder.
//
// This replaces the earlier functions/_middleware.js Pages Function — that
// convention only applies to classic Cloudflare Pages projects, not Workers.
// The core gating logic is unchanged; only how static assets are served
// differs: Pages Functions call next(), Workers call env.ASSETS.fetch(request).
//
// Setup:
//   wrangler secret put BYPASS_SECRET
//   (sets the secret for this Worker; run once per environment)
//
// Usage:
//   Visit https://napravimi.com/?bypass=<BYPASS_SECRET> once. This sets a
//   cookie and redirects to the clean URL. Subsequent visits use the cookie.
//   Anyone without the cookie or token sees the coming-soon page, on any URL.

const COOKIE_NAME = "napravimi_bypass";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const bypassSecret = env.BYPASS_SECRET;

		// Fail open if the secret isn't configured, so a missing binding
		// doesn't accidentally lock the whole site (including you) out.
		if (!bypassSecret) {
			return env.ASSETS.fetch(request);
		}

		if (hasValidCookie(request, bypassSecret)) {
			return env.ASSETS.fetch(request);
		}

		const queryToken = url.searchParams.get("bypass");
		if (queryToken === bypassSecret) {
			return issueBypassCookieAndRedirect(url, bypassSecret);
		}

		return new Response(COMING_SOON_HTML, {
			status: 200,
			headers: { "Content-Type": "text/html; charset=utf-8" },
		});
	},
};

function hasValidCookie(request, bypassSecret) {
	const cookieHeader = request.headers.get("Cookie") || "";
	const expected = `${COOKIE_NAME}=${encodeURIComponent(bypassSecret)}`;
	return cookieHeader
		.split(";")
		.map((c) => c.trim())
		.includes(expected);
}

function issueBypassCookieAndRedirect(url, bypassSecret) {
	const cleanUrl = new URL(url);
	cleanUrl.searchParams.delete("bypass");

	const headers = new Headers();
	headers.set("Location", cleanUrl.toString());
	headers.append(
		"Set-Cookie",
		`${COOKIE_NAME}=${encodeURIComponent(bypassSecret)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; Secure; HttpOnly; SameSite=Lax`
	);

	return new Response(null, { status: 302, headers });
}

const COMING_SOON_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>NapraviMi — Coming Soon</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body {
    margin: 0;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: system-ui, -apple-system, sans-serif;
    background: #0b0f14;
    color: #eaeaea;
  }
  h1 {
    font-size: 1.75rem;
    font-weight: 600;
    letter-spacing: -0.02em;
  }
</style>
</head>
<body>
  <h1>Coming soon.</h1>
</body>
</html>`;