# Universal Code Review Standards

Use these principles for every language and repository. Treat them as review guidance,
not as a substitute for the project's own requirements, tests, analyzer configuration,
or security policy.

## Review priorities

Review changed code for observable defects, in this order:

1. **Correctness:** wrong results, broken requirements, incorrect state transitions,
   race conditions, and boundary or error-path bugs.
2. **Security and privacy:** exploitable input handling, authorization gaps, secret
   exposure, unsafe data flow, and unintended disclosure.
3. **Reliability:** unhandled failures, resource leaks, retry or timeout mistakes,
   unsafe concurrency, and loss or corruption of data.
4. **Compatibility:** breaking API, data, protocol, configuration, or platform changes
   that are not intentional or documented.
5. **Maintainability:** changes that materially increase defect risk, obscure important
   behavior, or make required future changes unnecessarily difficult.
6. **Performance and accessibility:** measurable regressions or unmet requirements,
   not hypothetical concerns without evidence.

Formatting, naming preferences, and other low-impact style issues are secondary. Do not
report a style issue that is already consistently handled by the formatter or configured
linter.

## Evidence and scope

- Review the diff in context. Read relevant callers, callees, tests, schemas, and
  configuration when needed to establish behavior.
- Report issues introduced by the change or made materially worse by it. Do not present
  unrelated existing debt as a new finding.
- Ground each finding in a specific changed line or a clearly identified changed behavior.
  Cite an existing contract, code path, or realistic input that demonstrates the issue.
- Do not infer a vulnerability solely from a function or identifier name. Trace untrusted
  input, trust boundaries, validation, and impact before raising security concerns.
- Account for language, framework, platform, and tool versions visible in the repository.
  Do not assume a feature, API, or rule exists in every version.
- If context is missing or behavior depends on an assumption, state the uncertainty and
  lower confidence instead of presenting it as fact.

## What makes a useful finding

Each finding should:

- Describe one independently actionable defect.
- Explain the triggering condition and concrete impact.
- Point to the smallest relevant changed location.
- Give a practical remediation direction without prescribing an unnecessary rewrite.
- Use a severity that matches the real impact and likelihood.
- Avoid duplicating an analyzer finding unless the review adds important context or catches
  a consequence the analyzer did not identify.

Do not report:

- Pure preferences, speculative risks, or hypothetical future requirements.
- Issues already ruled out by a visible guard, contract, test, or framework guarantee.
- A request to add tests as a standalone finding unless missing tests conceal a specific
  high-risk behavior and the review explains it.
- The same root cause multiple times under different titles.

## Severity guide

- **Critical:** credible, broadly exploitable or catastrophic impact, such as unauthenticated
  compromise of sensitive systems or irreversible loss of critical data.
- **High:** likely major security, data-integrity, availability, or core-workflow failure
  affecting important users or conditions.
- **Medium:** a concrete defect with meaningful but bounded impact, a common edge-case
  failure, or a substantial maintainability problem likely to cause bugs.
- **Low:** limited impact, uncommon trigger, or a smaller but still actionable defect.
- **Info:** useful non-blocking observation; use sparingly and never for a subjective
  preference.

Consider both impact and the conditions required to trigger the issue. Severity is not a
measure of how strongly a reviewer prefers a different implementation.

## Language-neutral quality checklist

### Behavior and boundaries

- Are stated requirements and invariants preserved on success, failure, and retry paths?
- Are empty, missing, malformed, oversized, duplicate, and boundary-valued inputs handled
  correctly where applicable?
- Are units, time zones, precision, ordering, encoding, and nullability unambiguous?
- Are state changes atomic where partial completion would leave invalid state?
- Are resources acquired and released reliably, including on exceptions and cancellation?
- Are concurrent operations safe, and are shared state and ordering assumptions justified?

### Security and privacy

- Is authorization checked at the resource and operation boundary, not only in the UI?
- Is untrusted data validated and safely encoded for its destination context?
- Are secrets, personal data, and internal details excluded from logs, errors, URLs, and
  client-visible responses unless explicitly required?
- Are file paths, commands, queries, templates, redirects, and deserialization protected
  against injection or unsafe interpretation?
- Are cryptography and access-control decisions delegated to established, correctly
  configured libraries and policy?

### Reliability and interfaces

- Do errors remain visible and actionable rather than being swallowed or converted into
  success-shaped fallbacks?
- Are timeouts, retries, idempotency, rate limits, and partial failures handled according
  to the remote dependency's contract?
- Are public interfaces, persisted formats, and configuration changes compatible or
  deliberately migrated?
- Are optional values and lifecycle states handled explicitly?

### Tests and operations

- Do tests verify externally observable behavior and important failure cases?
- Are tests deterministic and isolated from real credentials, production systems, and
  uncontrolled external services?
- Are logs and metrics useful for diagnosis without exposing sensitive data?
- Are deployment, migration, rollback, and configuration implications addressed when the
  change requires them?
- Are performance claims supported by relevant data or by a clearly understood algorithmic
  or resource-use change?

## Reporting format

Use the review system's finding fields consistently:

- **Title:** concise statement of the defect, not a generic category.
- **Severity/category:** reflect impact and the nature of the issue.
- **Location:** the changed file and nearest relevant changed line; use no line when the
  issue is genuinely not line-specific.
- **Explanation:** evidence, trigger, and impact.
- **Recommendation:** the smallest practical correction or verification.
- **Confidence:** reflect how directly the diff and repository context support the claim.

When no actionable issue is supported by evidence, do not invent findings to fill a quota.
