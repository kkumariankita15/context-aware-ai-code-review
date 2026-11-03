# Language and Ecosystem Quality Standards

Apply the universal review principles first, then use the relevant language guidance below.
These are review prompts, not mandatory style rules. Follow the repository's formatter,
compiler settings, framework conventions, target versions, and analyzer configuration.
Do not report a language-specific concern when the file's language or runtime is uncertain.

## General implementation checks

- Prefer established, maintained libraries over custom parsing, cryptography, protocol, or
  serialization code.
- Use explicit ownership, lifetime, nullability, error, and concurrency semantics provided
  by the language and framework.
- Avoid unnecessary global state, hidden side effects, unsafe dynamic evaluation, and
  unbounded resource consumption.
- Validate at trust boundaries and encode for the exact output context.
- Preserve public API and data compatibility, or provide an intentional migration.
- Keep abstractions proportionate to the problem; do not equate fewer lines with better
  quality.

## JavaScript and TypeScript

- Check asynchronous work for rejection handling, cancellation/lifecycle behavior, and
  accidental unhandled promises.
- Avoid `eval` and unsafe HTML or URL sinks with untrusted data; verify the framework's
  escaping and sanitization behavior.
- In TypeScript, prefer concrete types and safe narrowing; avoid `any` when it removes
  important checks, and validate external data at runtime.
- Consider JavaScript coercion, equality, optional values, mutation, and prototype-related
  behavior where relevant.
- For browser code, consider keyboard accessibility, user-data exposure, and cleanup of
  listeners, subscriptions, timers, and object URLs.
- Follow configured ESLint, TypeScript, framework, and formatter rules; do not invent
  universal naming or semicolon preferences.

## Python

- Consider Python and dependency versions, virtual-environment assumptions, and platform
  compatibility.
- Handle exceptions specifically enough to preserve useful failure behavior; avoid broad
  catches that silently discard errors.
- Check mutable defaults, shared mutable state, resource context managers, and iterator
  exhaustion or lazy-evaluation assumptions.
- Treat deserialization, dynamic imports/evaluation, subprocess arguments, filesystem
  paths, and template rendering as trust boundaries.
- Use type hints and static analysis to clarify contracts, but validate runtime inputs
  where data crosses an untyped boundary.
- Follow configured Ruff/Flake8/Pylint, mypy/Pyright, formatter, and test rules.

## Java and Kotlin

- Verify nullability, resource management, exception propagation, and ownership of mutable
  objects across API boundaries.
- Consider thread safety, executor/lifecycle management, transaction boundaries, and
  blocking work on event or request threads.
- Check equality/hash contracts and collection mutation when objects are used as keys or
  set members.
- Review serialization, reflection, deserialization, and dependency-injection boundaries
  for unsafe assumptions.
- For Kotlin, inspect coroutine cancellation/structured concurrency, dispatcher use, and
  nullable/platform types.
- Follow configured compiler, Checkstyle/PMD/SpotBugs, Detekt/ktlint, and framework rules.

## C and C++

- Treat buffer bounds, integer overflow, pointer validity, ownership, lifetime, and
  allocation/deallocation pairing as high-priority correctness concerns.
- Review concurrency for data races, synchronization errors, and unsafe publication.
- Check undefined behavior, signedness conversions, format strings, and assumptions about
  alignment, encoding, or platform-specific sizes.
- Verify error paths release resources and do not leave partially initialized state.
- For C++, prefer clear RAII ownership and avoid unnecessary raw owning pointers; consider
  move/copy behavior and exception safety.
- Interpret static analyzer results against the actual compiler, target, sanitizer, and
  build configuration.

## C# and .NET

- Check nullability annotations, disposal (`IDisposable`/`IAsyncDisposable`), cancellation
  tokens, and exception behavior across async boundaries.
- Avoid sync-over-async patterns where they can block or deadlock; verify fire-and-forget
  tasks have a deliberate error/lifecycle policy.
- Consider LINQ deferred execution, multiple enumeration, and query translation when using
  an ORM.
- Review authorization, model binding, serialization, and dependency-injection lifetimes
  at framework boundaries.
- Follow target-framework support, nullable settings, Roslyn analyzers, and `.editorconfig`.

## Go

- Check every relevant error path; avoid discarded errors when failure affects correctness,
  security, or resource state.
- Verify goroutine lifetime, channel closure/ownership, cancellation propagation, and
  synchronization of shared state.
- Check context deadlines and cancellation for network and long-running operations.
- Consider slice/map aliasing, nil versus empty values, and data races.
- Follow module and language-version declarations, `go vet`, and configured staticcheck or
  golangci-lint rules.

## Rust

- Review `unsafe` blocks against their documented safety invariants and all call sites.
- Check panic boundaries, error propagation, lock ordering, poisoning assumptions, and
  cancellation behavior in async code.
- Consider ownership and borrowing around shared state, FFI, and resource cleanup.
- Verify feature flags, MSRV, target platform, and dependency versions.
- Treat Clippy and compiler lints as configuration-dependent evidence, not proof of
  correctness.

## Ruby and PHP

- Check framework-specific escaping, mass assignment, authorization, CSRF, and query
  parameterization at request boundaries.
- Avoid unsafe deserialization, dynamic evaluation, shell interpolation, and path handling
  with untrusted values.
- Consider Ruby block/resource behavior and mutable defaults; in PHP, consider type
  coercion, strictness settings, and runtime-version compatibility.
- Follow the repository's RuboCop/Brakeman or PHPStan/Psalm/PHPCS configuration and
  framework conventions.

## Swift

- Consider optional handling, value/reference semantics, retain cycles, and resource
  lifecycle.
- Check actor isolation, `Sendable` assumptions, task cancellation, and shared mutable
  state in concurrent code.
- Verify error propagation and UI work on the appropriate execution context.
- Follow the configured Swift language version, deployment targets, SwiftLint, and compiler
  diagnostics.

## SQL and database migrations

- Parameterize values; do not concatenate untrusted input into executable SQL.
- Check transaction boundaries, isolation assumptions, locking, and consistency under
  concurrent updates.
- Review migrations for data preservation, safe rollout/rollback, table locks, and
  compatibility between old and new application versions.
- Check indexes and query shape when the change materially affects data volume or latency;
  avoid asserting performance impact without query or plan evidence.
- Verify the actual database dialect and version; SQL behavior is not uniform across
  engines.

## Shell and command scripts

- Quote expansions and pass arguments safely; avoid constructing executable commands from
  untrusted strings.
- Check exit-status propagation, pipeline failure behavior, cleanup traps, and temporary
  file permissions.
- Verify the declared shell and portability assumptions; Bash-specific syntax is not
  POSIX shell.
- Follow ShellCheck and formatter settings where configured.

## Configuration and infrastructure as code

- Review permissions, exposed network surfaces, secret handling, and safe defaults.
- Check environment-specific values, resource limits, health checks, and dependency
  ordering.
- Consider idempotency, drift, state migration, rollback, and the effect of replacing or
  destroying resources.
- Validate against pinned provider, schema, and platform versions. Treat policy-tool
  findings as configuration-specific and verify the deployment context.

## Applying language guidance in mixed repositories

- Identify each changed file's language and relevant runtime/framework from repository
  evidence before applying a checklist.
- Follow generated, vendored, migration, test, and configuration files' own conventions;
  exclude them only when project configuration or context supports doing so.
- If multiple language profiles apply, report the concrete defect once, using the language
  rules that explain its mechanism.
- If the repository defines stricter or different rules, prefer those documented project
  rules and note when a general recommendation does not apply.
