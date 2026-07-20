# API Standard

- Prefer typed server actions or explicit route handlers with schema validation.
- Authenticate and authorize every mutation server-side.
- Return stable error codes and safe user-facing messages.
- Use idempotency for imports, sync jobs and retryable writes.
- Paginate collection endpoints and bound search results.
- Document integration contracts and webhook signatures.
- Never expose service-role credentials or privileged database operations to the browser.
