// Hand written rather than generated, because a static export has no build step
// to hand a list of file names to. Nothing here needs one: the page is fetched
// fresh whenever there is a network and kept only as a fallback, and everything
// it asks for is stored the first time it is asked for.

// Raise this to throw away everything held under the old name. Only needed for
// files whose names never change, since a new build renames the rest.
const VERSION = 'v1';
const SHELL = `shell-${VERSION}`;
const RUNTIME = `runtime-${VERSION}`;
const APP = '/chat';

// Songs and clips belong to the rest of the site, run to megabytes, and are
// streamed in ranges rather than read whole. Storing them would fill the cache
// with the one thing that does not need to be in it.
const NEVER_STORED = /^\/(music|audio|video)\//;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.add(APP))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();

      await Promise.all(
        names
          .filter((name) => name !== SHELL && name !== RUNTIME)
          .map((name) => caches.delete(name)),
      );

      await self.clients.claim();
    })(),
  );
});

// The page itself, which has to be the current one wherever that is possible: a
// held copy of it names the scripts of the build it came from, and those are
// replaced by the next deployment. The copy is for having something to open
// when there is no network at all.
async function pageFirst(request) {
  try {
    const response = await fetch(request);

    // Held under the address that was asked for, since a host may serve this
    // page as `/chat`, `/chat/` or `/chat.html` and the copy is only useful if
    // it answers to whichever one the browser asks for next. A redirect is not
    // kept: replaying one as the answer to a navigation is an error in itself.
    if (response.ok && !response.redirected) {
      const cache = await caches.open(SHELL);

      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    const cached = (await caches.match(request)) ?? (await caches.match(APP));

    if (cached) return cached;

    throw error;
  }
}

// Everything the page asks for, which is nearly all scripts and styles under a
// name containing their own hash: once seen they can never be out of date, and
// a build that changes one asks for it under a new name.
async function storedFirst(request) {
  const cached = await caches.match(request);

  if (cached) return cached;

  const response = await fetch(request);

  // A 404 kept here would be served as the answer forever, and a response from
  // somewhere else cannot be read to know whether it is one.
  if (response.ok && response.type === 'basic') {
    const cache = await caches.open(RUNTIME);

    cache.put(request, response.clone());
  }

  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Openai and anything else off this origin is left alone entirely. An answer
  // to a question is not a file, and none of it should be held anywhere but the
  // conversation it belongs to.
  if (url.origin !== self.location.origin) return;

  if (NEVER_STORED.test(url.pathname)) return;

  event.respondWith(
    request.mode === 'navigate' ? pageFirst(request) : storedFirst(request),
  );
});
