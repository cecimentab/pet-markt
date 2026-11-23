import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { randomBytes } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Content-Security-Policy — single source of truth for every environment.
 *
 * The Angular CLI dev-server and Firebase/Node both serve the app through this
 * Express instance (see `reqHandler` below), so setting the header here covers
 * local dev and production with one policy. Only the API origin changes per
 * environment, via the `API_ORIGIN` env var (defaults to the local NestJS
 * GraphQL server).
 *
 * The Google hosts are required by Firebase Auth:
 *  - connect-src identitytoolkit/securetoken → email+password login & signup
 *  - script-src + frame-src apis.google.com / <authDomain> / accounts.google.com
 *    → signInWithPopup (Google sign-in)
 *
 * A fresh nonce is generated per request and placed in `script-src`/`style-src`.
 * Angular stamps the SAME nonce onto its inline SSR scripts (hydration event
 * replay) and inline styles via the `ngCspNonce` attribute on <app-root>; the
 * `NG_CSP_NONCE_PLACEHOLDER` token in index.html is swapped for the real nonce
 * below (the new SSR engine can't take a per-request `CSP_NONCE` provider).
 */
const CSP_NONCE_PLACEHOLDER = 'NG_CSP_NONCE_PLACEHOLDER';
const apiOrigin = process.env['API_ORIGIN'] ?? 'http://localhost:3000';
const firebaseAuthDomain =
  process.env['FIREBASE_AUTH_DOMAIN'] ?? 'pet-markt-test-ceci.firebaseapp.com';

function buildContentSecurityPolicy(nonce: string): string {
  return [
    `default-src 'self'`,
    `connect-src 'self' ${apiOrigin} https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com`,
    `script-src 'self' 'nonce-${nonce}' https://apis.google.com https://www.gstatic.com`,
    `style-src 'self' 'nonce-${nonce}'`,
    `frame-src 'self' https://${firebaseAuthDomain} https://accounts.google.com https://apis.google.com`,
    `img-src 'self' data: https://*.googleusercontent.com`,
    `font-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `frame-ancestors 'none'`,
  ].join('; ');
}

app.use((_req, res, next) => {
  const nonce = randomBytes(16).toString('base64');
  res.locals['cspNonce'] = nonce;
  res.setHeader('Content-Security-Policy', buildContentSecurityPolicy(nonce));
  next();
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/**', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 *
 * For HTML responses we swap the `ngCspNonce` placeholder (stamped by Angular
 * onto its inline SSR scripts/styles) for this request's real nonce, which is
 * already set in the CSP header above. Non-HTML responses pass through as-is.
 */
app.use('/{*splat}', (req, res, next) => {
  angularApp
    .handle(req)
    .then(async (response) => {
      if (!response) {
        next();
        return;
      }

      const isHtml = (response.headers.get('content-type') ?? '').includes(
        'text/html',
      );
      if (!isHtml) {
        await writeResponseToNodeResponse(response, res);
        return;
      }

      const nonce = res.locals['cspNonce'] as string;
      const html = (await response.text()).replaceAll(
        CSP_NONCE_PLACEHOLDER,
        nonce,
      );
      const noncedResponse = new Response(html, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
      await writeResponseToNodeResponse(noncedResponse, res);
    })
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
