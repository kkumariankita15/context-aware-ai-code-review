# Static Analysis and Linting Guidance

Use configured analyzer results as evidence and as a map to project conventions. An
analyzer warning is not automatically a review defect, and a clean analyzer run does not
prove correctness or security. Verify relevant findings against the changed code and the
repository's actual configuration.

## SonarQube

SonarQube analyzes code using the server's installed analyzers, project configuration,
quality profiles, exclusions, and quality gate. Review the rule identifier, severity,
primary location, and any secondary data-flow locations when available.

- Use the repository's configured quality profile and supported language analyzer; do not
  assume the default profile or a particular rule is enabled.
- Treat taint/data-flow results as a lead to trace sources, transformations, and sinks.
  Confirm whether validation, sanitization, or a trusted boundary changes the result.
- Distinguish bugs, vulnerabilities, security hotspots, and maintainability/code-smell
  observations. A security hotspot requests review of a sensitive pattern; it is not by
  itself proof of an exploitable vulnerability.
- Consider new-code and overall-code scopes separately. Do not attribute an old issue to a
  pull request unless the change introduces or worsens it.
- For quality-gate failures, identify the specific failing condition and changed-code
  contribution rather than reporting only that the gate is red.
- Check exclusions, generated code, test code, and language/version support before
  interpreting missing or unexpected results.

## SonarLint / SonarQube for IDE

SonarLint is the former name commonly used for SonarQube's IDE analysis experience.
Connected mode, where available and configured, can synchronize rules and settings with a
SonarQube or SonarQube Cloud project. Standalone behavior may differ.

- Confirm whether the IDE is connected to the project and whether the relevant rule is
  active in that project's quality profile.
- Treat an IDE issue as a useful local signal, not as evidence that CI or the server uses
  identical versions, scope, exclusions, or configuration.
- Check whether a reported issue is on new code and whether the diff actually introduced
  it.
- Do not report the same verified defect twice merely because SonarLint and SonarQube both
  display it.

## ESLint

ESLint applies the repository's effective configuration, parser, plugins, overrides,
ignore patterns, and supported language features. The rule set may vary by directory and
file type.

- Check the nearest applicable configuration, including flat config, legacy config,
  overrides, shared presets, plugins, and ignore files.
- Treat `error`/`warn` as configured reporting levels, not universal defect severities.
  Determine the actual behavior and impact before assigning review severity.
- Distinguish correctness- and safety-oriented rules from stylistic rules. Respect
  Prettier or another formatter where the project uses one.
- Be cautious with rules requiring type information; verify parser and project-service
  configuration for the file.
- Avoid proposing a rule suppression as the first fix. Prefer correcting the cause; when
  suppression is justified, keep it narrow and document the reason according to project
  practice.
- Do not assume ESLint covers non-JavaScript languages or every security concern.

## Equivalent tools by ecosystem

Use tools that the repository actually configures; names below are examples, not mandatory
dependencies:

| Ecosystem | Common examples | Review considerations |
|---|---|---|
| Python | Ruff, Flake8, Pylint, mypy, Pyright, Bandit | Check configured rules, type-check scope, Python version, and whether security results are confirmed in context. |
| Java / Kotlin | Checkstyle, PMD, SpotBugs, Detekt, ktlint, Error Prone | Verify build/profile integration, nullness assumptions, and whether a finding is on production or test code. |
| C / C++ | clang-tidy, compiler warnings, CodeQL, Cppcheck | Consider compiler flags, ownership/lifetime, undefined behavior, and platform-specific build settings. |
| C# / .NET | Roslyn analyzers, .NET analyzers, StyleCop | Check `.editorconfig`, target framework, generated-code exclusions, and configured warning severity. |
| Go | go vet, staticcheck, golangci-lint | Inspect enabled linters and build tags; verify concurrency and error-handling reports. |
| Rust | rustc lints, Clippy, cargo-audit | Check toolchain version, enabled lint levels, unsafe blocks, and dependency/advisory scope. |
| Ruby | RuboCop, Brakeman | Respect project cops and safe-navigation/framework context; validate security paths. |
| PHP | PHPStan, Psalm, PHP_CodeSniffer, PHP_Code_Analysis_Tool | Check configured level, framework stubs, baseline suppressions, and runtime version. |
| Swift | SwiftLint, compiler diagnostics | Check project rules and target configuration; review concurrency and actor-isolation behavior. |
| SQL | Database-native analyzers, SQLFluff | Check dialect, migration context, query plans where relevant, and parameterization. |
| Shell | ShellCheck, shfmt | Check target shell and invocation context; distinguish quoting defects from formatting preferences. |
| Infrastructure | Terraform validate/tflint, Checkov, kube-linter | Confirm provider/runtime versions, deployment scope, and whether policy findings are applicable. |

## Cross-tool interpretation

- Prefer the tool's rule ID and configuration over paraphrased claims about a default.
- A warning can be a false positive, accepted exception, generated-code issue, or stale
  baseline entry. Explain the evidence before escalating it.
- A suppression or baseline entry does not make an underlying exploitable bug safe.
- Do not claim a tool was run unless its output is available. Review can describe a likely
  check separately from an executed result.
- Check tool and rule versions when behavior is version-sensitive.
- When a tool finding duplicates a stronger review finding, consolidate them and include
  the rule ID as supporting evidence when useful.
- Avoid speculative analyzer recommendations such as "enable every rule." Suggest a
  targeted rule or configuration change only when it addresses a demonstrated gap.
