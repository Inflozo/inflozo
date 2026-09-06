import {
  browserSupportsWebAuthn,
  deserializeCredentialCreationOptions,
  deserializeCredentialRequestOptions,
  serializeCredentialCreationResponse,
  serializeCredentialRequestResponse,
} from '@supabase/auth-js/dist/module/lib/webauthn'
import type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
  ServerCredentialCreationOptions,
  ServerCredentialRequestOptions,
  ServerCredentialResponse,
} from '@supabase/auth-js/dist/module/lib/webauthn'

/**
 * THE ONE PLACE THE DEEP IMPORT LIVES — and the one place the type mismatch behind it is spent.
 *
 * `@supabase/auth-js` does not re-export the WebAuthn helpers: `dist/module/index.js` names no
 * webauthn module, and the package declares no `exports` map at all (`package.json` — `main`,
 * `module` and `types` only), so the deep path is both necessary and resolvable. Every other file
 * in the app imports them from HERE, so the day the path moves there is one line to change and
 * `pnpm build` says so.
 *
 * THE `Future` TYPES ARE WEBAUTHN LEVEL 3 AND `lib.dom` IS NOT. `auth-js` types the ceremony as
 * the current spec — `AuthenticatorTransportFuture` carries `"cable"`, and `PublicKeyCredential`
 * carries the `parse*FromJSON` statics — while TypeScript's own DOM library is still on the level
 * the browsers shipped first. Every browser accepts the newer shape at runtime (the extra
 * transports are hints it ignores when it does not know them), so the two are bridged HERE, in
 * four one-line wrappers, rather than at each call site with a cast that would have to be
 * explained twice.
 *
 * The wrappers hold no key and no session: base64url in, `PublicKeyCredential` options out, and
 * back. `serializeCredential*Response` prefers the platform's own `credential.toJSON()` and falls
 * back to reading the buffers by hand (`dist/module/lib/webauthn.js:153-167`), which is what makes
 * them safe to call on a credential from any browser that has one.
 *
 * ponytail: deep import, pinned to the direct `@supabase/auth-js` 2.115.0 dependency; copy the
 * ~40 lines of serialiser if a version ever hides the path.
 */
export { browserSupportsWebAuthn }
export type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
  ServerCredentialCreationOptions,
  ServerCredentialRequestOptions,
  ServerCredentialResponse,
}

export const creationOptions = (options: ServerCredentialCreationOptions) =>
  deserializeCredentialCreationOptions(options) as unknown as PublicKeyCredentialCreationOptions

export const requestOptions = (options: ServerCredentialRequestOptions) =>
  deserializeCredentialRequestOptions(options) as unknown as PublicKeyCredentialRequestOptions

export const registrationResponse = (credential: PublicKeyCredential): RegistrationResponseJSON =>
  serializeCredentialCreationResponse(
    credential as unknown as Parameters<typeof serializeCredentialCreationResponse>[0],
  )

export const authenticationResponse = (credential: PublicKeyCredential): AuthenticationResponseJSON =>
  serializeCredentialRequestResponse(
    credential as unknown as Parameters<typeof serializeCredentialRequestResponse>[0],
  )
