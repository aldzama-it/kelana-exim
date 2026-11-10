# AGENTS.md

Mandatory guidelines for developers and AI coding agents working on this project.
Read this document before making any change that touches the database, Git history, or deployment.

> Status: DRAFT. Items marked [VERIFY] must be checked against the actual repository before this document is adopted.

## 1. Project Stack

- Backend: Laravel [VERIFY: version]
- Frontend: React [VERIFY: version, build tool, folder location]
- Database: MySQL [VERIFY: version, engine must be InnoDB]
- ORM: Laravel Eloquent and the Laravel migration system
- Repository layout: [VERIFY: monorepo or separate repositories]

Rules that differ by engine are marked as **MySQL-specific**. Universal rules apply to any engine.

## 2. Database Engineering Principles

1. The database schema has one source of truth: the migration files in `database/migrations/`.
2. Every structural change MUST be made through a new migration.
3. Migration files MUST be committed to Git.
4. An existing migration MUST NOT be edited after it has been shared, merged, or run in any shared environment.
5. Existing data MUST be preserved. Destructive changes require the approval described in section 11.
6. No manual structural change (for example, `ALTER TABLE` run directly in a client) is allowed without a matching migration.
7. Data integrity and data safety take priority over development speed.
8. Developers and agents MUST understand the impact of a change before running it.

## 3. Schema Management

### 3.1 Definitions

- **Primary key**: every table MUST have a primary key. Use `id` (auto-increment `BIGINT UNSIGNED`) unless a documented exception exists.
- **Foreign key**: relations MUST be enforced with foreign key constraints where the engine supports them. **MySQL-specific**: the tables MUST use the InnoDB engine.
- **Data types**: choose the smallest type that fits the domain. Money values MUST use `DECIMAL`, never `FLOAT` or `DOUBLE`.
- **Nullability**: columns are `NOT NULL` by default. A column may be nullable only when absence of a value is a valid business state.
- **Defaults**: defaults MUST be explicit when a value is always known at insert time.
- **Unique constraints**: business keys (for example, request IDs, email addresses) MUST have a unique constraint.
- **Indexes**: columns used in `WHERE`, `JOIN`, or `ORDER BY` on large tables SHOULD be indexed. Foreign key columns SHOULD be indexed.
- **Timestamps**: use `created_at` and `updated_at` on all business tables. Soft deletes (`deleted_at`) are used only when a record must be recoverable; document the choice per table.
- **Character set**: **MySQL-specific**: use `utf8mb4` with `utf8mb4_unicode_ci` [VERIFY].
- **Naming**: table names are plural `snake_case` (`travel_requests`). Foreign keys are `<singular>_id`. Pivot tables use alphabetical singular names (`request_user`). Index and constraint names MUST be descriptive.

### 3.2 Referential integrity

- Child records MUST NOT reference a missing parent.
- `ON DELETE` behavior MUST be chosen explicitly and documented per relation. Do not rely on engine defaults.
- Do not disable foreign key checks to make a migration or seed succeed. Fix the order of operations instead.

### 3.3 Schema snapshot

- If the project keeps a schema snapshot (for example, `database/schema/mysql-schema.sql` produced by `php artisan schema:dump`), it MUST be regenerated in the same commit as the migration that changed the schema. [VERIFY: whether a snapshot exists]
- The migration files are the source of truth. The snapshot is a derived artifact and MUST NOT be edited by hand.
- Do not delete or replace a snapshot without approval.

## 4. Migration Management

### 4.1 Rules

1. Every structural change MUST have a migration.
2. Migration names MUST be descriptive, for example `2026_11_06_100000_create_travel_requests_table.php`. Laravel generates the timestamp prefix; do not rename generated files.
3. One migration SHOULD perform one logical change.
4. A migration that has been shared or run in a shared environment MUST NOT be edited. A mistake is corrected with a new corrective migration.
5. Migrations MUST be tested in local development before they are committed.
6. Migrations MUST run identically in every environment.
7. Production migrations MUST come only from reviewed and merged code.

### 4.2 Commands (Laravel)

| Action | Command | Notes |
|---|---|---|
| Create migration | `php artisan make:migration <name>` | Use `create_*_table` or `add_*_to_*_table` naming. |
| Run pending migrations | `php artisan migrate` | Local and staging. |
| Check status | `php artisan migrate:status` | Run before and after any migration. |
| Run in production | `php artisan migrate --force` | Only after the checklist in section 10 is complete. |
| Roll back | `php artisan migrate:rollback --step=1` | Not safe for destructive changes. See 4.3. |

### 4.3 Rollback

- Rollback is not always safe or possible. A `down()` method that drops a column or table destroys data.
- A rollback that destroys data requires the approval in section 11.
- Prefer a corrective forward migration over a rollback in any shared environment.

### 4.4 Baseline and squashing

- A baseline or squashed migration (`php artisan schema:dump --prune`) MUST NOT be created without team agreement, because it changes the migration history.
- Squashing is allowed only on a branch where no environment has run the old migrations.

## 5. Seed Management

- Migrations change structure. Seeders insert or update reference data.
- Seeders live in `database/seeders/`. Development-only data MUST be in a separate seeder class from production reference data (for example, `DevelopmentSeeder` and `ReferenceDataSeeder`).
- Seeders MUST be idempotent. Use `updateOrCreate()` or `firstOrCreate()` keyed on a natural key, not `create()`.
- Seeders MUST NOT delete or overwrite operational data.
- Seeders MUST respect foreign key order. Seed parents before children.
- Production seeding MUST be explicit (`php artisan db:seed --class=ReferenceDataSeeder --force`). Do not run `db:seed` without a class in production.
- Do not use a seeder to repair production data. Write a reviewed data migration or a one-off script with approval.

**Example**

- Migration: `create_roles_table` creates the `roles` table structure.
- Seeder: `ReferenceDataSeeder` inserts the rows `approver`, `director`, `finance`, `requester`, keyed on `name`, so it can run again safely.

## 6. Team Collaboration and Git Workflow

1. All migrations and seeders MUST be committed to Git.
2. A schema change and its related model, migration, and snapshot changes MUST be committed together.
3. Pull the latest branch before creating a migration.
4. Check the existing migration list before creating a new one, to avoid conflicting names.
5. Do not delete a migration that belongs to another developer.
6. Do not edit a shared migration to resolve a Git merge conflict.
7. When two migrations conflict in intent, resolve it explicitly in review. Both migrations MUST remain.
8. After pulling, run `php artisan migrate` locally to sync the database with the latest migrations.

### 6.1 Commit convention

Format: `type(scope): description`

- Language: English.
- Description: one sentence, lowercase after the colon, no trailing period, no bullet points. Keep it short; a longer single sentence is acceptable when the change needs it.
- One commit per logical change. Do not bundle unrelated files into one commit.

Examples:
- `feat(database): add travel_requests table`
- `fix(database): correct foreign key on approvals table`
- `refactor(database): standardize timestamp columns across tables`
- `chore(seeders): make reference data seeder idempotent`

Allowed types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `build`, `ci`.

### 6.2 Pull Requests

- Every database change MUST go through a pull request with at least one reviewer.
- The PR MUST include the checklist in section 13.
- The PR description MUST state whether the change is destructive, and how the data is preserved.

## 7. Environments

| Environment | Purpose | Database rules |
|---|---|---|
| Development | Feature work and testing | Local database. May be reset. Seeded with development data. |
| Staging | Integration testing before production | Mirrors production structure. Data is anonymized. |
| Production | Live operational data | Never reset. Migrations only after review and backup. |

- Each environment has its own `.env`. Credentials MUST NOT be hardcoded or committed.
- Do not use production credentials for experiments.
- Do not copy production data to development. If it is necessary, anonymize it and get approval.
- Production MUST NOT be reset with development commands such as `migrate:fresh` or `db:wipe`.

## 8. Backup Policy

**Backups MUST NOT be stored on the same production database volume, storage device, or directory as the original database.**

### 8.1 Principles

- Follow the 3-2-1 rule: 3 copies of data, on 2 different storage media, with 1 copy offsite.
- Preferred destinations: a separate server, NAS, external storage, or cloud object storage.

### 8.2 Rules

1. Production MUST have a scheduled backup.
2. Backup frequency MUST match the agreed RPO (see section 9).
3. Backup file names MUST include the environment, database name, and a UTC timestamp.
4. Backups MUST NOT be committed to Git.
5. Backups MUST NOT be deleted during deployment.
6. Every backup MUST be verified after it is created (file size, checksum, and a test restore on a schedule).
7. Restores MUST be tested regularly in an isolated environment.
8. Backup storage access MUST be restricted.
9. Every backup policy MUST define a retention period.

### 8.3 Example retention (starting point, adjust to project needs)

- Daily: keep 7 days.
- Weekly: keep 4 weeks.
- Monthly: keep 12 months.

### 8.4 MySQL backup example

```bash
mysqldump \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  --default-character-set=utf8mb4 \
  -h "$DB_HOST" -u "$DB_USER" -p \
  "$DB_NAME" | gzip > "/mnt/backup-remote/${DB_NAME}_$(date -u +%Y%m%dT%H%M%SZ).sql.gz"
```

- `--single-transaction` gives a consistent snapshot for InnoDB without locking tables.
- Store the output on remote storage, not on the database server's data volume.
- Verify with `gzip -t` and a restore test.

Do not use `--result-file` or write the dump into the Laravel project directory.

### 8.5 SQLite note

Not applicable unless SQLite is used for a specific purpose. [VERIFY: if local SQLite is used, use the SQLite Online Backup API, check WAL and SHM files, and run `PRAGMA integrity_check`.]

## 9. Restore and Recovery

- **RPO** (Recovery Point Objective): the maximum acceptable data loss, measured in time. It determines backup frequency. [VERIFY: agreed value]
- **RTO** (Recovery Time Objective): the maximum acceptable downtime. It determines the recovery procedure. [VERIFY: agreed value]

Restore procedure:

1. Identify the backup and its timestamp.
2. Verify the backup (checksum, `gzip -t`, and a test restore).
3. Confirm the target environment and database name.
4. Protect the current database. Take a fresh backup first, even if the current data looks broken.
5. Stop or restrict writes (maintenance mode: `php artisan down`).
6. Restore into an isolated database first when possible.
7. Verify integrity and row counts.
8. Run application smoke tests.
9. Record the incident, the backup used, and the time taken.

**Production restore MUST NOT be performed by an AI coding agent without explicit approval from the responsible person.**

## 10. Production Deployment Workflow

1. Review the database changes in the pull request.
2. List the pending migrations (`php artisan migrate:status`).
3. Identify potential data loss, locking, and breaking changes. Large table changes SHOULD be scheduled outside peak hours.
4. Take a verified production backup if the change carries risk.
5. Deploy application code that is compatible with both the old and new schema, where possible.
6. Run `php artisan migrate --force`.
7. Run build steps required by the frontend and the framework (for example, `npm run build`, `php artisan config:cache`).
8. Verify the schema (`php artisan migrate:status`, spot check the affected tables).
9. Verify the application.
10. Monitor logs and errors after deployment.

The exact order MUST be adjusted to the deployment setup. [VERIFY: current deployment method]

Never assume a migration is safe for production because it passed in development.

## 11. Destructive Operations

The following operations can destroy data:

- `DROP DATABASE`, `DROP TABLE`, `DROP COLUMN`
- `TRUNCATE TABLE`, `DELETE FROM` without a narrow `WHERE`
- `migrate:fresh`, `migrate:reset`, `db:wipe`
- Destructive `down()` methods
- Rewriting migration history

Rules:

1. Each operation MUST have a written justification.
2. Each operation MUST have an impact assessment.
3. A verified backup MUST exist and be restorable.
4. Explicit approval from the responsible person MUST be obtained before execution.
5. Destructive operations MUST NOT be used to fix a migration error.

## 12. Instructions for AI Coding Agents

These rules are mandatory.

### 12.1 Before a change

An agent MUST:
1. Inspect the database configuration.
2. Inspect the current schema and migration list.
3. Inspect related tables and relationships.
4. Understand the existing naming conventions.
5. Identify data-loss risks.
6. Explain the proposed database change before implementing it.

### 12.2 During a change

An agent MUST:
1. Follow the existing database architecture.
2. Create a new migration for every structural change.
3. Never modify a shared migration.
4. Never invent business rules or relationships. Ask when a rule is unclear.
5. Never introduce a second schema management system without approval.
6. Keep changes minimal and scoped to the task.
7. Preserve existing data.

### 12.3 After a change

An agent MUST:
1. Review the generated SQL.
2. Verify schema consistency and migration execution.
3. Verify foreign keys and indexes.
4. Run the relevant tests.
5. Report the changed files.
6. Explain the impact on existing data.
7. Explain deployment and recovery requirements.

### 12.4 Prohibited

An agent MUST NOT:
- Reset a production database.
- Delete production records without explicit approval.
- Drop tables or columns without explicit approval.
- Modify a shared migration file.
- Rewrite migration history.
- Delete or overwrite backup files.
- Perform a production restore without explicit approval.
- Disable database constraints to bypass an error.
- Use destructive operations to resolve a migration conflict.

## 13. Database Change Review Checklist

- [ ] The existing schema was inspected.
- [ ] The migration name is unique and descriptive.
- [ ] No existing migration file was changed.
- [ ] The generated SQL was reviewed.
- [ ] The schema snapshot was regenerated, if the project keeps one.
- [ ] Primary keys and foreign keys are correct.
- [ ] Data types and constraints are appropriate (`DECIMAL` for money).
- [ ] Existing data is preserved.
- [ ] Indexes are appropriate.
- [ ] The migration was tested in development.
- [ ] Application functionality was tested.
- [ ] Backup and recovery implications were considered.
- [ ] Deployment steps are documented in the PR.

## 14. Git Ignore and Repository Hygiene

### 14.1 MUST be ignored

```gitignore
# Environment and secrets
.env
.env.local
.env.*
!.env.example
*.pem
*.key

# Laravel generated and local
/vendor/
/node_modules/
/public/hot
/public/storage
/storage/*.key
/storage/logs/
/storage/framework/cache/
/storage/framework/sessions/
/storage/framework/testing/
/storage/framework/views/
/bootstrap/cache/*.php

# Local databases and exports
*.sqlite
*.sqlite3
*.db
*.db-wal
*.db-shm
*.sql.gz
/backups/
/dumps/

# Build output and IDE
/public/build/
.idea/
.vscode/
*.swp
.DS_Store
```

[VERIFY: compare with the existing `.gitignore` before replacing any rule.]

### 14.2 MUST remain tracked

- `database/migrations/**`
- `database/seeders/**`
- `database/factories/**`
- Schema snapshot, if maintained (`database/schema/*.sql`)
- `.env.example`
- Any SQL script needed to initialize a clean development database

### 14.3 Restrictions

- Never ignore all `.sql` files globally. Ignore only specific dump and backup patterns.
- Never commit production dumps or credentials.
- Check whether a file is already tracked before assuming `.gitignore` protects it. Use `git ls-files <path>`.
- Adding a rule does not remove a file that is already tracked. Use `git rm --cached` only with approval.
- If a secret was committed, report it, rotate the credential, and do not rewrite history without approval.

### 14.4 Verification

```bash
git check-ignore -v .env database/backups/test.sql.gz
git check-ignore -v database/migrations/2026_11_06_000000_example.php   # must print nothing
git status --short
```

## 15. Documentation

- Write in clear, concise English.
- Use MUST, MUST NOT, SHOULD, and MAY consistently.
- Keep this file in the repository root. Update it in the same pull request as any change to database rules.

## 16. Project Architecture and Technical Context

AI agents MUST understand the existing structure and technology before proposing or making any change. Documentation of a framework MUST NOT replace reading this project's own implementation.

### 16.1 Required context

The following MUST be documented and kept current in this file or in `docs/architecture.md`:

- Folder structure and the responsibility of each module.
- Tech stack and exact versions: PHP, Laravel, Node.js, React, MySQL. [VERIFY]
- Communication flow: React → HTTP API (Laravel routes) → controllers → services → repositories or Eloquent models → MySQL.
- Modules that depend on each other, and in which direction.
- Application entry points: `public/index.php` (Laravel), the React entry file. [VERIFY]
- Main configuration files: `config/*.php`, `.env`, `vite.config.*` or equivalent. [VERIFY]
- Location of environment files and which variables each environment requires.

### 16.2 Rules

1. An AI agent MUST read the existing implementation of a feature before designing a new approach to it.
2. An AI agent MUST NOT assume the project structure from framework documentation. Laravel's default layout is a starting point only.
3. An AI agent MUST follow the existing pattern (for example, how existing controllers call services) unless a change of pattern is approved (see 25.6).
4. An AI agent MUST NOT create a new top-level folder or module without approval.

### 16.3 Business domain reference

The domain flow for travel requests MUST be kept in a single document (for example, `docs/business-flow.md`). Current agreed flow, for reference:

- Requester submits → atasan approves → admin verifies → admin selects and corrects tickets → Direktur → Direktur Utama → payment (CC direct, TF via finance) → ticket issued → archived.
- Cancel and reschedule use the approver chain the request has already reached.

Code MUST implement the business flow as documented. If the code and the document disagree, report the conflict and do not choose silently.

## 17. Coding Standards and Consistency

### 17.1 Naming

Follow the conventions already used in the repository. Where none exist, use the following:

| Element | Convention | Example |
|---|---|---|
| PHP class | PascalCase | `TravelRequestService` |
| PHP method and variable | camelCase | `submitForApproval()`, `$requestDate` |
| PHP file | matches class name | `TravelRequestService.php` |
| Database table | plural snake_case | `travel_requests` |
| Database column | snake_case | `created_at` |
| React component | PascalCase, one per file | `TravelRequestTable.jsx` |
| React hook | `use` prefix | `useTravelRequests.js` |
| React utility and non-component file | camelCase | `formatCurrency.js` |
| Route name and API path | kebab-case, plural resource | `/api/travel-requests` |
| Constants | UPPER_SNAKE_CASE | `MAX_UPLOAD_SIZE_MB` |

### 17.2 Structure and separation of responsibilities

- **Controllers** handle HTTP only: read validated input, call a service, return a response. They MUST NOT contain business rules or raw queries.
- **Form Requests** (Laravel) validate input and authorize the action, where the project uses them.
- **Services** contain business logic and workflow transitions (for example, status changes of a request). They MUST NOT depend on HTTP objects such as `Request` or `Response`.
- **Repositories or Eloquent scopes** handle data access. Presentation logic MUST NOT appear in queries.
- **Resources** (Laravel API Resources) shape the response. Models MUST NOT be returned directly from controllers.
- **React components** handle presentation. Data fetching lives in hooks or a service module, not inside deeply nested presentational components.
- Workflow status changes MUST go through one service method per transition, so the rules live in one place.

### 17.3 Reuse and duplication

1. Search the repository for an existing component, utility, or service before writing a new one.
2. Extract a helper when the same logic appears a third time, not the first time.
3. Shared UI elements (tables, status chips, buttons, modals, form fields) MUST be reused rather than re-implemented per page.
4. Do not copy an entire file to create a variant. Parameterize the existing component.

### 17.4 Abstraction

- Do not add an interface, factory, base class, or generic framework for a single use case.
- Prefer plain functions and explicit code over indirection that only moves code around.
- Add an abstraction when there are at least two real, current uses and the shape is clear.

### 17.5 Architecture changes

- Do not change the architecture pattern (for example, adding a new state library, switching from services to actions, or introducing a microservice) without a written proposal and approval.
- A change of library requires approval. Include the reason, the license, the maintenance status, and the bundle or runtime cost.

## 18. Security and Access Control

Principle: **the UI is not a security boundary.** Every access restriction MUST be enforced on the server. Hiding a button or menu is only a usability feature.

### 18.1 Authentication and session

- Authentication MUST use the company SSO provider agreed for this project. [VERIFY: provider, protocol such as OIDC or SAML]
- MFA MUST be required for Admin and Finance roles. [VERIFY: policy]
- Sessions MUST expire after inactivity. Session cookies MUST be `HttpOnly`, `Secure` in non-local environments, and `SameSite=Lax` or stricter.
- Session IDs MUST be regenerated after login.
- Logout MUST invalidate the server-side session.

### 18.2 Authorization

- Access MUST be checked for every request on the server, using Laravel policies or gates. [VERIFY: existing mechanism]
- A user MAY access a record only if the role allows the action and the user is related to that record (requester owns it, or is the assigned approver, or has an operational role).
- Role and permission definitions MUST live in one place and be seeded or configured, not scattered across code.
- Routes MUST declare their required permission. A route without an explicit policy is a defect.

### 18.3 Approval links

Approval links sent through wa.me MUST:

1. Contain an unguessable token, or a reference that is useless without authentication. Never expose a plain approval action in a URL.
2. Require SSO login of the approver the link was issued to. The server MUST check that the logged-in user matches the expected approver.
3. Check the current request status and approval level on submission. A link for a stale level MUST be rejected.
4. Be single-purpose and single-use for the state it was issued for.
5. Expire after a defined period. [VERIFY: duration]
6. Not contain personal data beyond what is needed to identify the request.

### 18.4 IDOR and object access

- Every endpoint that accepts an identifier (`/api/travel-requests/{id}`) MUST verify that the current user may access that specific object.
- Sequential IDs MUST NOT be used as the only protection. Expose external references that are not guessable if records are reachable by URL.

### 18.5 Input and output protection

- Validate all input on the server. Frontend validation is for feedback only.
- Use parameter binding or Eloquent query builder for all queries. Do not concatenate user input into SQL.
- Escape output in React (the default JSX behavior). Do not use `dangerouslySetInnerHTML` without sanitization and approval.
- Use Laravel's CSRF protection for state-changing web routes. For token-based API routes, document the mechanism.
- Uploaded files (KTP, e-ticket, receipts, bank proof) MUST be validated for type, size, and extension. Store them outside the public directory and serve them through an authorized route.
- Set security headers (CSP, `X-Content-Type-Options`, `Referrer-Policy`) where the deployment allows. [VERIFY]

### 18.6 Secrets and sensitive data

- Passwords, API keys, tokens, and connection strings MUST NOT be hardcoded. Use `.env` or a secret manager.
- Do not log passwords, tokens, full identity numbers (NIK), bank account numbers, or card data. Mask them where display is needed (for example, `***` plus the last 3 digits, as the prototype does for contact details).
- Responses MUST NOT include password hashes, internal stack traces, or secrets. Use API Resources to whitelist fields.
- Personal data (NIK, phone, email) MUST be accessible only to roles that need it.

## 19. API and Data Handling

### 19.1 Endpoint standards

| Method | Use |
|---|---|
| `GET` | Read. No side effects. |
| `POST` | Create, or a state transition that is not idempotent. |
| `PUT` / `PATCH` | Update. `PATCH` for partial updates. |
| `DELETE` | Remove. Prefer a status change for business records. |

- Business state changes SHOULD use explicit action endpoints (for example, `POST /api/travel-requests/{id}/submit`) when a simple update would hide a workflow rule.
- Versioning: prefix with `/api/v1` once the first external consumer exists. [VERIFY]

### 19.2 Response format

Success:

```json
{
  "data": { "id": "REQ-001", "status": "approver_pending" },
  "meta": { "request_id": "..." }
}
```

Error (validation):

```json
{
  "message": "The given data was invalid.",
  "errors": { "departure_date": ["Tanggal berangkat tidak boleh di masa lalu."] },
  "code": "VALIDATION_ERROR"
}
```

- Use HTTP status codes correctly: `200`, `201`, `204`, `400`, `401`, `403`, `404`, `409` (state conflict), `422` (validation), `429`, `500`, `503`.
- Error responses MUST NOT expose stack traces outside local development.
- Use one error format across the whole API. [VERIFY: current format]

### 19.3 Request validation

- Every endpoint MUST validate its input with explicit rules.
- Reject unknown fields for write endpoints, or ignore them explicitly. Do not pass request arrays directly to `Model::create()` or `fill()` without a whitelist (`$fillable` or validated subset).

### 19.4 Pagination, filtering, sorting

- All list endpoints MUST be paginated. Default page size and maximum page size MUST be defined.
- Filter and sort fields MUST be whitelisted. Never allow arbitrary column names from the client.
- Response metadata MUST include total count and current page.

### 19.5 Date, time, currency, timezone

- Store timestamps in UTC in the database.
- Display in `Asia/Jakarta` (WIB) for users unless the project decides otherwise. [VERIFY]
- Date-only fields (departure date) MUST be stored as `DATE`, not `DATETIME`, and transmitted as `YYYY-MM-DD`.
- Timestamps in API responses MUST use ISO 8601 with offset (for example, `2026-11-06T09:00:00+07:00`).
- Currency is IDR. Store amounts as `DECIMAL(15,2)` or integer rupiah, never as float. Format for display with `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })`.
- Do not depend on the server's or browser's local timezone for business logic.

### 19.6 External APIs and data

- Schedule and fare data from external sources MUST NOT be assumed valid. Validate every field and handle missing or unexpected values.
- Every outbound HTTP call MUST have a timeout. Retries MUST be limited, use exponential backoff, and only be applied to idempotent requests (or requests with an idempotency key).
- When an external API fails or returns no data, the application MUST show an explicit state (for example, "Jadwal tidak tersedia, coba lagi"), not an empty table that looks like "no results".
- Cache external responses only with a defined time-to-live and a stated reason.
- Credentials for external services MUST come from configuration, not code.

## 20. Error Handling and Logging

### 20.1 Error categories

Distinguish these explicitly:

| Category | HTTP | Meaning | Example |
|---|---|---|---|
| Validation | 422 | Input is invalid. User can fix it. | NIK not 16 digits |
| Authentication | 401 | Not logged in or session expired. | Session timeout |
| Authorization | 403 | Logged in but not allowed. | Requester opening another person's request |
| Not found | 404 | Resource does not exist or is hidden. | Unknown request ID |
| Conflict | 409 | The action conflicts with the current state. | Approving an already rejected request |
| System | 500 | Unexpected failure. Not the user's fault. | Database connection lost |

### 20.2 Rules

1. Use Laravel's exception handler (`bootstrap/app.php` or `app/Exceptions/Handler.php`, whichever the project uses) as the single place that maps exceptions to responses. [VERIFY]
2. Do not use empty `catch` blocks. Every catch MUST either handle the error meaningfully, rethrow, or log it with context.
3. Do not swallow exceptions to make the page look normal.
4. Do not return `200` for a failed operation.
5. Business rule violations MUST be expressed as domain exceptions (for example, `InvalidStatusTransitionException`), not as generic `Exception`.
6. Frontend MUST handle errors for every request: loading, error, and empty states (see section 22).

### 20.3 Logging

- Use Laravel's logging channels. Use the level that matches the severity (`info`, `warning`, `error`).
- Log entries MUST include: what happened, the request ID, the user ID (not the name or personal data), the affected record ID, and the relevant state.
- Log entries MUST NOT include: passwords, tokens, full NIK, card numbers, bank account numbers, or full request bodies that contain personal data.
- Audit trail for business actions (approve, reject, pay, issue ticket, cancel, refund) MUST be stored in the database, not only in log files. [VERIFY: existing audit table]
- Logs MUST be rotated and retained according to a defined policy.

### 20.4 Troubleshooting support

- Every API error SHOULD carry a request ID that appears in the log, so support can match a user report to a log entry.
- Error messages shown to users MUST be understandable. Technical details go to the log, not to the screen.

## 21. Testing and Quality Assurance

AI agents MUST NOT consider a task complete until the checks below have been run, or the reason they could not be run has been reported.

### 21.1 Test levels

| Level | Scope | Tooling [VERIFY] |
|---|---|---|
| Unit | Business logic in services, pure functions, React utilities | PHPUnit or Pest, Vitest or Jest |
| Integration | Database queries, repositories, external API adapters (with fakes) | PHPUnit with a MySQL test database |
| Feature | Full HTTP request to response, including authorization | Laravel feature tests |
| End-to-end | Real user flows across React and API | Playwright or Cypress, if the project adopts it |
| Regression | Existing behavior that must not change | Keep existing tests; add a test when fixing a bug |

### 21.2 Rules

1. Business logic MUST have unit tests. Status transitions, approval levels, and price calculations are the highest priority.
2. Every new endpoint MUST have feature tests covering: success, validation failure, unauthorized access, and not-found.
3. Authorization MUST be tested with at least one user who is not allowed. A passing test that only uses an admin account proves nothing about access control.
4. Edge cases MUST be covered: empty input, maximum length, duplicate submission, concurrent approval, expired link, and invalid state transition.
5. Database tests MUST run against a MySQL database (or the same engine as production), not a different engine. [VERIFY]
6. Use factories and seeders for test data. Do not depend on data that exists only in one developer's local database.
7. Tests MUST be deterministic. Do not depend on the current time without freezing it (`Carbon::setTestNow()`).

### 21.3 Checks before saying work is done

Run and report the result of:

```bash
# Backend
php artisan test
./vendor/bin/pint --test              # code style, if Pint is used [VERIFY]
./vendor/bin/phpstan analyse          # static analysis, if used [VERIFY]

# Frontend
npm run lint
npm run typecheck                     # if TypeScript is used [VERIFY]
npm run test
npm run build
```

- If a check cannot be run (missing dependency, no database), say so and explain. Do not claim it passed.
- Lint errors MUST be fixed, not suppressed with disable comments unless there is a documented reason.

### 21.4 Forbidden shortcuts

AI agents MUST NOT:
- Delete, skip (`markTestSkipped`, `it.skip`), or weaken a test to make the pipeline pass.
- Loosen an assertion to match a wrong result.
- Remove a failing check from CI.
- Mock the database in a way that hides a real query error, when an integration test is required.

When a test fails, the agent MUST first determine whether the code or the test is wrong, explain the finding, and only then change the appropriate side.

## 22. UI/UX and Frontend Standards

### 22.1 Design consistency

- Colors, typography, spacing, border radius, shadows, and icons MUST come from design tokens or the existing theme. Do not hardcode new values per component. [VERIFY: where tokens live]
- Use the existing icon set. Do not add a second icon library.
- Use the existing layout components (shell, sidebar, page header, tables, cards).

### 22.2 Responsive design

- Support desktop, tablet, and mobile.
- Tables MUST have a mobile layout (stacked rows or horizontal scroll with a fixed first column). The prototype's table pattern is the reference: summary cards above, search and filter bar, paginated rows.
- Minimum touch target size: 44 × 44 px on touch devices.

### 22.3 States

Every data view MUST implement these states:

- **Loading**: skeleton or spinner, not a blank screen.
- **Empty**: a clear message and, where relevant, the next action ("Belum ada pengajuan. Buat pengajuan baru.").
- **Error**: what went wrong in plain language, and a retry action.
- **Success**: confirmation after a state change, with the new status shown.
- **Partial data**: when external data is missing (for example, no schedule available), say so explicitly.

### 22.4 Destructive actions

- Cancel, reject, refund, delete, and any irreversible action MUST show a confirmation dialog that states the consequence.
- Require a reason for rejection, cancellation, and reschedule. The prototype already uses this pattern.
- Disable the submit button while a request is in progress to prevent double submission.

### 22.5 Forms

- Validate on the client for feedback and on the server for correctness.
- Show errors next to the field, in plain language, after the user leaves the field or submits.
- Preserve user input when a server error occurs.
- Label every field. Placeholders are not labels.

### 22.6 Accessibility (baseline)

- Interactive elements MUST be keyboard accessible.
- Images MUST have alt text. Decorative images use `alt=""`.
- Color MUST NOT be the only indicator of status. Pair color with text or an icon.
- Color contrast MUST meet WCAG 2.1 AA for text.
- Dialogs MUST trap focus and return focus when closed.
- Use semantic HTML (`button`, `table`, `label`) before adding ARIA.

### 22.7 Scope of change

- When asked to fix one component, change only that component and what it directly needs.
- Do not redesign a page, change the color scheme, or replace a component library while fixing a bug.
- New dependencies require approval (see 17.5).

## 23. Performance and Optimization

- Avoid N+1 queries. Use eager loading (`with()`) for relations that are displayed in lists. Verify with query logging in development.
- Paginate all lists. Do not load full tables into the client to filter in memory.
- Select only the columns needed for a view (`select([...])`) for large tables.
- Add indexes for columns used in filters and sorts, verified against real query plans (`EXPLAIN`).
- Frontend: avoid re-rendering large tables on every keystroke. Debounce search input.
- Code-split routes that are not needed on first load. Keep the initial bundle small.
- Check bundle size after adding a dependency. Do not add a library for a single small helper.
- Cache only when justified: store the reason, the key, the time-to-live, and the invalidation rule. Do not cache authorization decisions or payment status.
- Long-running work (exports, bulk imports, notifications) SHOULD run through queued jobs, not in the request cycle.

## 24. Deployment, Rollback, and Environment

### 24.1 Environment differences

| Setting | Development | Staging | Production |
|---|---|---|---|
| `APP_ENV` | `local` | `staging` | `production` |
| `APP_DEBUG` | `true` | `false` | `false` |
| Database | local MySQL | separate MySQL | production MySQL |
| SSO | test or mock provider | staging provider | production provider |
| External APIs | sandbox or fake | sandbox | live |
| Mail and WhatsApp | logged, not sent | sent to test numbers | sent to real recipients |
| Seeders | development data allowed | reference data only | reference data only, explicit |

- `APP_DEBUG=true` MUST NEVER be deployed outside local development.
- Each environment MUST have its own secrets. Do not share a `.env` file between environments.
- Configuration cache (`php artisan config:cache`) MUST be generated during deployment, not committed.

### 24.2 Build and deployment standards

1. Build artifacts MUST be produced from a tagged or reviewed commit.
2. Dependencies MUST be installed from lock files (`composer.lock`, `package-lock.json`). Use `composer install --no-dev --optimize-autoloader` in production.
3. The frontend build (`npm run build`) MUST succeed before deployment.
4. Deployment MUST be scripted or documented step by step. [VERIFY: current method]
5. Run in this order: maintenance mode on (if needed), code deploy, dependency install, migrations (section 10 of the database rules), cache rebuild, maintenance mode off.

### 24.3 Health check

After every deployment, verify:

- The application responds on a health endpoint (for example, `GET /up` in Laravel 11+, or a custom `/health`). [VERIFY]
- Database connectivity works.
- Login via SSO works with a test account in staging, and with an agreed smoke procedure in production.
- Core flows work: create request, view list, approval link opens for the right user.
- Error rate and response time in logs or monitoring are normal for 15 minutes after deployment.

### 24.4 Compatibility and expand-and-contract

Database changes and application changes MUST stay compatible during deployment, because old and new application versions can run at the same time.

Use **expand-and-contract** whenever a schema change could break the previous application version:

1. **Expand**: add the new column, table, or index. Make it nullable or give it a default. Deploy code that writes to both old and new structures, or reads the new one when present.
2. **Migrate data**: backfill the new structure in a separate, reviewed step. Run it in batches for large tables.
3. **Switch**: deploy code that reads and writes only the new structure.
4. **Contract**: after all application instances are on the new version and a safe period has passed, remove the old column or table in a later migration. This step is destructive and requires approval (section 11).

Examples that require expand-and-contract:
- Renaming a column.
- Changing a column type.
- Making a nullable column `NOT NULL`.
- Splitting one table into two.

Adding a new nullable column or a new table is usually safe in a single step.

### 24.5 Application rollback

1. Every release MUST be reversible to the previous release artifact. Keep at least the last two releases on the server. [VERIFY]
2. Rollback of code MUST NOT require rollback of the database if the schema is backward compatible (section 24.4).
3. If a release included a non-backward-compatible migration, rollback requires a documented plan: restore from backup, or run a reviewed corrective migration. Never roll back a migration that drops data without approval.
4. The rollback procedure MUST be written in the release notes and tested in staging at least once per quarter. [VERIFY: frequency]

### 24.6 Failed deployment

- If a migration fails midway, stop. Do not run it again blindly. Inspect the database state, record it, and decide with the responsible person.
- If the application fails after deployment, roll back the code first (24.5), then investigate.
- Record every failed deployment: time, version, cause, action taken.

### 24.7 Production server configuration

- Production server configuration (web server, PHP settings, queue workers, cron, firewall, SSL) MUST NOT be changed without a review and a written change plan.
- AI agents MUST NOT change production configuration files or server settings. They MAY propose a change in a document for review.
- Changes to queue workers and scheduled tasks MUST be coordinated, because they can run jobs twice or not at all.

## 25. AI Agent Behavior and Change Management

This section is mandatory for every AI coding agent working in this repository. It applies to all tasks, not only database tasks.

### 25.1 Before any change

An agent MUST:

1. Read `AGENTS.md` and any documentation linked from it (for example, `docs/business-flow.md`, `docs/architecture.md`) before starting.
2. Check the repository state: current branch, uncommitted changes (`git status --short`), and recent commits (`git log --oneline -n 20`).
3. Understand the existing implementation of the affected feature, including the controllers, services, models, routes, policies, and tests involved.
4. Identify which parts of the request are clear and which are ambiguous.

### 25.2 Analysis and plan

An agent MUST present, before editing:

1. What it found in the existing implementation.
2. The files it expects to change, and why.
3. The proposed approach, and any alternative it considered.
4. Risks: data impact, security impact, breaking changes, and affected users.
5. Open questions. The agent MUST ask rather than assume.

For a small, obvious fix in one file, a short plan is enough. For anything touching more than one module, the database, authorization, or the public API, a full plan is required.

### 25.3 Business logic and requirements

- An agent MUST NOT invent business logic, approval rules, prices, statuses, or user needs.
- When a rule is missing, the agent MUST ask. It MUST NOT choose a default that changes the business outcome.
- When the business flow document and the request conflict, the agent MUST report the conflict.

### 25.4 Scope

- An agent MUST NOT change files outside the scope of the task.
- Unrelated refactoring, formatting of untouched files, and renaming for taste are out of scope.
- If the agent discovers a bug outside the scope, it MUST report it and MUST NOT fix it silently in the same change, unless approved.

### 25.5 Features and code

- An agent MUST NOT remove or simplify an existing working feature to make its own implementation easier.
- An agent MUST preserve existing behavior unless the task explicitly changes it.
- An agent MUST NOT change libraries, frameworks, folder structure, or architecture pattern without approval (see 17.5).

### 25.6 Commits

- Commit only when asked. Never push to a protected branch.
- Commit in logical groups, using the convention in section 6.1.
- Do not commit secrets, local databases, backups, or generated files (section 14).
- Do not rewrite history (`rebase`, `reset --hard`, `push --force`) without approval.
- Do not use `--no-verify` to skip hooks.

### 25.7 Verification

After changes, an agent MUST:

1. Run the checks in section 21.3 and report results.
2. Verify its change against the actual behavior, not only that the code compiles. For UI changes, load the page and check the states in section 22.3.
3. Check that existing tests still pass, and add tests for the new behavior.

### 25.8 Report

Every completed task MUST end with a report containing:

1. **Files changed**, with the reason for each.
2. **Test and check results**: what was run, what passed, what was not run and why.
3. **Data impact**: whether existing data is affected, and how it is preserved.
4. **Deployment impact**: migrations, configuration changes, cache clears, queue restarts.
5. **Remaining risks** and anything the reviewer must decide.
6. **Assumptions** made, so the reviewer can correct them.

### 25.9 Stop conditions

An agent MUST stop and ask when:

- The request requires a destructive operation (section 11).
- The request would change production configuration or data.
- The request needs a new dependency, new architecture pattern, or new external service.
- The existing implementation contradicts the request and the right behavior is unclear.
- A check fails and the cause is not understood.
- The change would affect authorization, approval logic, or payment flow, unless the requirement is explicit and reviewed.

### 25.10 Summary of prohibitions

An agent MUST NOT:

1. Read the existing code and then ignore it.
2. Assume framework defaults over project conventions.
3. Invent business rules, prices, or user needs.
4. Change files outside the task scope.
5. Replace libraries or architecture without approval.
6. Delete or weaken tests to pass a pipeline.
7. Remove working features to simplify an implementation.
8. Claim a check passed when it was not run.
9. Expose secrets in code, logs, or responses.
10. Perform destructive or production actions without explicit approval.