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
<html lang="sr">
<head>
<meta charset="UTF-8">
<title>NapraviMi — Ускоро доступно</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body {
    margin: 0;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.75rem;
    font-family: system-ui, -apple-system, sans-serif;
    background: #171614;
    color: #f3efe6;
  }
  .logo {
    width: min(70vw, 320px);
    height: auto;
  }
  p {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }
</style>
</head>
<body>
  <svg class="logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 240" role="img" aria-label="НаправиМи">
    <g transform="translate(40.00,140) scale(0.10738,-0.10738)"><path d="M156 -9Q112 -9 88.0 15.5Q64 40 64 85V620Q64 666 88.0 690.0Q112 714 156 714Q201 714 224.5 690.0Q248 666 248 620V433H539V620Q539 666 562.5 690.0Q586 714 631 714Q675 714 698.5 690.0Q722 666 722 620V85Q722 40 698.5 15.5Q675 -9 631 -9Q586 -9 562.5 15.5Q539 40 539 85V282H248V85Q248 40 225.0 15.5Q202 -9 156 -9Z" fill="#f3efe6"/></g>
    <g transform="translate(124.40,140) scale(0.10738,-0.10738)"><path d="M232 -11Q175 -11 131.5 10.0Q88 31 63.5 67.5Q39 104 39 151Q39 205 67.0 236.0Q95 267 157.0 280.5Q219 294 322 294H377V210H322Q283 210 257.5 204.5Q232 199 220.0 187.5Q208 176 208 158Q208 135 224.5 120.0Q241 105 272 105Q297 105 316.5 116.0Q336 127 348.0 146.5Q360 166 360 192V308Q360 344 341.5 359.0Q323 374 278 374Q254 374 224.0 368.5Q194 363 157 349Q130 339 111.0 346.0Q92 353 81.5 370.0Q71 387 71.5 407.0Q72 427 84.5 445.0Q97 463 123 473Q171 491 211.5 497.0Q252 503 286 503Q368 503 421.5 479.5Q475 456 501.5 407.5Q528 359 528 283V81Q528 37 507.0 14.0Q486 -9 446 -9Q405 -9 383.5 14.0Q362 37 362 81V107L368 93Q363 61 345.0 38.0Q327 15 298.0 2.0Q269 -11 232 -11Z" fill="#f3efe6"/></g>
    <g transform="translate(187.33,140) scale(0.10738,-0.10738)"><path d="M149 -9Q107 -9 83.5 14.0Q60 37 60 81V393Q60 442 85.5 467.0Q111 492 159 492H471Q519 492 544.5 467.0Q570 442 570 393V81Q570 37 546.5 14.0Q523 -9 481 -9Q438 -9 415.0 14.0Q392 37 392 81V356H238V81Q238 37 215.5 14.0Q193 -9 149 -9Z" fill="#f3efe6"/></g>
    <g transform="translate(254.98,140) scale(0.10738,-0.10738)"><path d="M149 -189Q107 -189 84.0 -166.0Q61 -143 61 -99V412Q61 455 83.5 478.0Q106 501 148 501Q191 501 213.5 478.0Q236 455 236 412V354L225 403Q239 448 283.5 475.5Q328 503 385 503Q449 503 497.5 472.0Q546 441 573.0 384.0Q600 327 600 246Q600 167 573.0 109.0Q546 51 497.5 20.0Q449 -11 385 -11Q330 -11 286.0 15.0Q242 41 227 83H239V-99Q239 -143 215.5 -166.0Q192 -189 149 -189ZM329 120Q356 120 376.5 133.5Q397 147 409.0 174.5Q421 202 421 246Q421 313 395.0 342.5Q369 372 329 372Q302 372 281.0 359.0Q260 346 248.0 318.5Q236 291 236 246Q236 180 262.0 150.0Q288 120 329 120Z" fill="#f3efe6"/></g>
    <g transform="translate(323.49,140) scale(0.10738,-0.10738)"><path d="M232 -11Q175 -11 131.5 10.0Q88 31 63.5 67.5Q39 104 39 151Q39 205 67.0 236.0Q95 267 157.0 280.5Q219 294 322 294H377V210H322Q283 210 257.5 204.5Q232 199 220.0 187.5Q208 176 208 158Q208 135 224.5 120.0Q241 105 272 105Q297 105 316.5 116.0Q336 127 348.0 146.5Q360 166 360 192V308Q360 344 341.5 359.0Q323 374 278 374Q254 374 224.0 368.5Q194 363 157 349Q130 339 111.0 346.0Q92 353 81.5 370.0Q71 387 71.5 407.0Q72 427 84.5 445.0Q97 463 123 473Q171 491 211.5 497.0Q252 503 286 503Q368 503 421.5 479.5Q475 456 501.5 407.5Q528 359 528 283V81Q528 37 507.0 14.0Q486 -9 446 -9Q405 -9 383.5 14.0Q362 37 362 81V107L368 93Q363 61 345.0 38.0Q327 15 298.0 2.0Q269 -11 232 -11Z" fill="#f3efe6"/></g>
    <g transform="translate(386.42,140) scale(0.10738,-0.10738)"><path d="M146 0Q104 0 82.0 22.0Q60 44 60 86V407Q60 448 82.0 470.0Q104 492 146 492H356Q426 492 468.0 476.5Q510 461 528.0 432.0Q546 403 546 364Q546 318 515.5 287.0Q485 256 434 248V263Q503 257 534.0 224.5Q565 192 565 140Q565 76 514.0 38.0Q463 0 364 0ZM223 103H343Q375 103 390.5 115.0Q406 127 406 152Q406 176 390.5 188.0Q375 200 343 200H223ZM223 303H334Q359 303 373.0 314.5Q387 326 387 347Q387 369 373.0 379.5Q359 390 334 390H223Z" fill="#f3efe6"/></g>
    <g transform="translate(450.20,140) scale(0.10738,-0.10738)"><path d="M142 -9Q115 -9 96.5 1.0Q78 11 69.0 32.0Q60 53 60 85V417Q60 458 81.0 479.5Q102 501 141 501Q179 501 199.5 479.5Q220 458 220 417V189H192L386 445Q400 463 422.5 482.0Q445 501 486 501Q514 501 532.0 491.0Q550 481 559.0 460.5Q568 440 568 407V75Q568 35 547.5 13.0Q527 -9 488 -9Q449 -9 428.5 13.0Q408 35 408 75V304H436L242 47Q229 29 206.5 10.0Q184 -9 142 -9Z" fill="#f3efe6"/></g>
    <g transform="translate(517.64,140) scale(0.10738,-0.10738)"><path d="M149 -9Q109 -9 87.5 13.0Q66 35 66 75V630Q66 671 89.0 692.5Q112 714 154 714Q189 714 209.5 700.5Q230 687 247 656L462 270H427L641 656Q659 687 679.5 700.5Q700 714 735 714Q775 714 796.5 692.5Q818 671 818 630V75Q818 35 797.0 13.0Q776 -9 735 -9Q695 -9 673.5 13.0Q652 35 652 75V419H673L512 139Q498 117 482.5 106.0Q467 95 441 95Q416 95 400.0 106.0Q384 117 371 139L209 420H232V75Q232 35 211.0 13.0Q190 -9 149 -9Z" fill="#e8555d"/></g>
    <g transform="translate(612.56,140) scale(0.10738,-0.10738)"><path d="M142 -9Q115 -9 96.5 1.0Q78 11 69.0 32.0Q60 53 60 85V417Q60 458 81.0 479.5Q102 501 141 501Q179 501 199.5 479.5Q220 458 220 417V189H192L386 445Q400 463 422.5 482.0Q445 501 486 501Q514 501 532.0 491.0Q550 481 559.0 460.5Q568 440 568 407V75Q568 35 547.5 13.0Q527 -9 488 -9Q449 -9 428.5 13.0Q408 35 408 75V304H436L242 47Q229 29 206.5 10.0Q184 -9 142 -9Z" fill="#e8555d"/></g>
    <line x1="100.0" y1="210" x2="288.0" y2="210" stroke="#f3efe6" stroke-width="2"/>
    <line x1="432.0" y1="210" x2="620.0" y2="210" stroke="#f3efe6" stroke-width="2"/>
    <polygon points="326.0,204 332.0,210 326.0,216 320.0,210" fill="#b7c89a"/>
    <polygon points="360.0,204 366.0,210 360.0,216 354.0,210" fill="#e8555d"/>
    <polygon points="394.0,204 400.0,210 394.0,216 388.0,210" fill="#b7c89a"/>
  </svg>
  <p>Ускоро доступно</p>
</body>
</html>`;