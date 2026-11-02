# Angular Standards

## Components
- Use standalone components for new development.
- Keep components focused on presentation and orchestration.
- Avoid business logic inside components.

## Services
- All HTTP communication must happen through services.
- Use strongly typed HTTP responses.
- Avoid direct API calls from components.

## RxJS
- Avoid nested subscriptions.
- Use async pipe where appropriate.
- Use takeUntilDestroyed for long-lived subscriptions.

## TypeScript
- Avoid any.
- Prefer explicit interfaces and types.
- Use readonly where applicable.

## Performance
- Prefer OnPush change detection where suitable.
- Track repeated collections efficiently.
- Avoid unnecessary template computations.