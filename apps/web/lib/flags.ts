/**
 * Feature flags are ROWS in `feature_flags`, read server-side per request, defaulting to off
 * (spine, Feature flags): an environment variable cannot be flipped without a redeploy, which
 * is the one capability FR-A2 asks for.
 *
 * `passkeys` is seeded `false` (schema :716) and Story 2.1 is what turns it on.
 *
 * WHY THIS DOES NOT QUERY YET. `feature_flags` is granted to `service_role` only (schema
 * :1175) with RLS on and no policy, so the publishable key cannot read it — and this story
 * carries no secret key by its own Keys constraint. A query here would be a round trip that is
 * guaranteed to fail on every render of the sign-in page, so the flag resolves to its seeded
 * value instead. Story 2.1 needs both halves at once — the row flipped and a server-side
 * reader with the secret key — and this is the one place it changes. Logged as DW-12.
 */
export async function passkeysEnabled(): Promise<boolean> {
  return false
}
