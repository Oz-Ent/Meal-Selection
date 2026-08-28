# Meal App Analytics and Reporting

This document identifies the analytics and reports that the Meal application can support today, the features that should be instrumented, and the work required before those reports are production-ready.

It covers both repositories:

- Frontend: `Meal-Selection`
- Backend: `Meal-App-Core`

## Current State

The application already records the core operational facts needed for meal reporting: selections, weeks, menus, meals, users, availability, selection status, delegated selections, saved presets, and computed taste profiles.

The current admin report at `src/pages/Admin/Report/Report.tsx` demonstrates a useful report layout and PDF export, but it uses hardcoded data. It is not yet connected to an API, is not scoped to a real week, and must not be used as a source of operational numbers.

The immediate priority is to connect a real weekly selection report for kitchen and HR operations. Product-usage analytics should be added separately and only with an approved privacy policy.

## Audiences and Decisions

| Audience | Decisions supported | Appropriate detail |
| --- | --- | --- |
| Kitchen or operations | How many portions of each meal to prepare; which users are incomplete | Per-week, per-day, per-meal counts; named users only where follow-up is required |
| Admin and HR | Participation, delegated selections, availability-adjusted follow-up, menu planning | Aggregates by week and user-level audit detail behind role checks |
| Menu planners | Which meals, proteins, preparations, and calorie ranges are preferred | Aggregates and trends; no names by default |
| Individual user | Their own weekly selections and food-preference profile | Their own data only |
| Engineering and product owners | Reliability and adoption of the selection workflow | Pseudonymous product events, error rates, and feature funnel metrics |

## Existing Data That Can Be Reported

### Selections

`Meal-App-Core/prisma/schema.prisma` defines `Selections` as the core reporting fact. Each record provides:

- The selected meal and its menu day: `dayMealId`, `menuDayId`
- The scheduled week: `weekMenuScheduleId`
- The actor and recipient: `createdBy`, `createdFor`
- Lifecycle status: `PENDING` or `SUBMITTED`
- Audit timestamps: `createdAt`, `updatedAt`

This supports daily and weekly portion counts, participation, submission completion, meal popularity, delegated-selection audit, and time-to-selection metrics. The uniqueness rule on `(createdBy, weekMenuScheduleId, menuDayId)` protects each selector from duplicate selections for a week/day.

Important interpretation: `createdBy` is the user who made the choice and `createdFor` is the user the choice was made for. A delegated-selection report must count meals by `createdFor` when measuring consumption or portions, but use `createdBy` when auditing who acted.

### Menus, Schedule, and Meals

`WeekMenuSchedule` ties a calendar week/year to a menu and exposes the schedule lifecycle: `DRAFT`, `ACTIVE`, `LOCKED`, and `CLOSED`. `MenuDays` and `MenuDayMeals` identify the day and available meal options. `Meals` provides name, `foodCode`, optional calories, and active status.

This supports menu uptake, option conversion, meal rankings, food-cost planning inputs, and comparisons between weeks. `foodCode` is parsed as `SUPERGROUP-MEAL-PROTEIN-PREP`, which enables category-level preference reports when the code is valid.

### Users and Availability

`Users` provides role, active/inactive/retired status, activation state, and a DigiHR reference ID. `UserAvailability` provides leave date ranges.

This supports an eligibility denominator for participation reports. A user on approved leave should be excluded from an incomplete-selection alert for the affected dates. Do not treat absence data as a performance measure.

### Presets

`Presets` and `PresetItems` capture user-saved combinations for a menu. They can show whether presets are used, where users repeatedly configure the same choices, and which menu layouts produce reusable combinations. Existing data does not record when a preset was applied, so it cannot yet prove that a preset caused a submitted selection.

### Taste Profiles

The backend helper `src/helpers/tasteProfileMetrics.ts` calculates, per user and calendar year:

- Counts by supergroup, meal category, protein, preparation, and protein/preparation combination
- `uniqueMeals`, `repeatedMeals`, total and average calories
- Diversity and consistency scores
- Favorite protein and a personality classification

This is suitable for an optional, user-facing preference summary and anonymized menu-planning aggregates. It is not a clinical nutrition or health assessment. Calorie values are nullable, so calorie averages must display coverage, such as “based on 82% of selected meals with calorie data.”

## Reports Available From Existing Data

### 1. Weekly Kitchen Production Report

**Purpose:** Prepare portions for each day and meal.

**Filters:** week/year, day, menu, selection status.

**Measures:**

- Submitted recipients per meal and day
- Pending recipients per meal and day, shown separately
- Total portions by meal/day and total daily portions
- Users with no completed weekly selection, excluding approved leave
- Last-updated timestamp and report generation time

**Sources:** `Selections`, `WeekMenuSchedule`, `MenuDays`, `MenuDayMeals`, `Meals`, `Users`, and `UserAvailability`.

**Existing access:** `/meal-selections/weekly`, `/meal-selections/weekly/by-date`, and `/meal-selections/weekly/no-selections` provide raw selection views. A server-side aggregate endpoint is still recommended so the frontend does not calculate operational totals from large, personally identifiable result sets.

### 2. Participation and Completion Report

**Purpose:** Find whether meal selection is complete early enough for operations.

**Measures:**

- Eligible users: active users less users on applicable approved leave
- Users with at least one selection
- Users with a full five-day selection
- Submitted versus pending selections
- Completion rate: `fully submitted eligible users / eligible users`
- Missing selections by day and by user
- Completion trend by calendar week

**Caution:** The current no-selection API returns users with fewer than five selections. It should be reconciled with the business definition of “complete” and must account for selected days, active schedule, availability, and status before it becomes an official KPI.

### 3. Meal Popularity and Menu Planning Report

**Purpose:** Choose future menus and estimate demand.

**Filters:** date range, calendar week, menu, day, meal, status.

**Measures:**

- Selection count and share for each meal
- Rank within day, week, and selected date range
- Demand by supergroup, protein, preparation, and food combination
- Week-over-week change in selections and share
- Number of active options offered versus options selected
- Meals with zero selections

**Sources:** selections joined to meals and the parsed `foodCode` taxonomy. Include only `SUBMITTED` selections in operational rankings; expose pending choices separately for planning forecasts.

### 4. Menu Performance Report

**Purpose:** Compare menus rather than only individual meals.

**Measures:**

- Total and average selections per menu day
- Option uptake: selected options / options offered
- Meal concentration: share represented by the top one or top three meals
- Variety: unique selected meals / total selections
- Completion rate while each menu was active
- Reuse of a menu across scheduled weeks

**Sources:** `WeekMenuSchedule`, `Menus`, `MenuDays`, `MenuDayMeals`, `Selections`.

### 5. Delegated Selection Audit

**Purpose:** Audit selections made by one employee for another.

**Measures:**

- Count of self selections versus delegated selections
- Creator, recipient, week/day, selected meal, creation time, and update time
- Delegated selections that remain pending

**Access:** Admin/HR only. This should be an auditable table, not a broad dashboard metric. Avoid using it to judge employee behavior.

### 6. User Preference Summary

**Purpose:** Let a user understand their own historic selections and help menu planners see anonymous aggregate preferences.

**Measures:**

- Favorite protein/preparation and most selected categories
- Diversity and consistency score
- Average calories with non-null calorie coverage
- Year-to-date number of selected meals
- Preference changes across calendar years

**Sources:** `TasteProfile` and its `metrics` JSON. Existing endpoints under `/users/taste-profiles` expose this data, but the frontend has not yet integrated it.

### 7. Availability-Adjusted Operations Report

**Purpose:** Estimate active demand and avoid chasing employees who are away.

**Measures:**

- Users available for each meal day
- Users on leave by day/week
- Selection completion among available users
- Expected portions versus availability-adjusted eligible users

**Caution:** Only report absence aggregates necessary for operations. Do not expose reasons for leave or individual leave history in a general report.

## Frontend Features That Need Analytics

The following are product-usage events, distinct from reporting data in the database. They are not currently stored by the application.

| Feature | Events worth recording | Why it matters |
| --- | --- | --- |
| Authentication and onboarding | onboarding requested, registration completed, login succeeded/failed, password-reset requested/completed | Measures activation and authentication friction without storing credentials or tokens |
| Meal selection | selection started, day reached, meal chosen/changed, delegated mode opened, batch saved, submit succeeded/failed | Shows the selection funnel and where users abandon it |
| Spin wheel | opened, spun, suggested meal accepted/rejected | Determines whether random selection is useful; never record unnecessary screen or interaction detail |
| Weekly activities | weekly view opened, week navigated, empty/error state shown | Identifies whether users review past selections and API reliability issues |
| Admin reports | report opened, filters applied, PDF exported, export failed | Validates reporting demand and prioritizes requested filters/formats |
| Menu and meal management | create/edit/publish/archive actions, validation failure, save failure | Identifies workflow bottlenecks and provides an administrative audit trail |
| Presets | preset created, edited, deleted, applied | Measures adoption; add an explicit `presetApplied` audit/event if attribution is required |

Product events should include an event name, occurred-at timestamp, authenticated user ID or a privacy-preserving identifier, role, route/feature area, success/failure, and non-sensitive context such as week ID or menu ID. Do not store meal notes, passwords, reset tokens, raw emails, or full API payloads in analytics events.

## What Must Be Built

### Backend

1. Add authenticated, role-authorized reporting endpoints. The existing selection routes return raw records and currently show no authentication middleware in `src/app.ts` or `src/routes/selectionRoutes.ts`.
2. Build server-side aggregation endpoints rather than making the client join and count raw selection data. Suggested endpoints:

   - `GET /reports/weekly-production?week=&year=&status=`
   - `GET /reports/participation?startDate=&endDate=`
   - `GET /reports/meal-popularity?startDate=&endDate=&menuId=&day=`
   - `GET /reports/menu-performance?startDate=&endDate=`
   - `GET /reports/delegated-selections?week=&year=`
   - `GET /reports/export?...&format=csv|pdf`

3. Enforce access in the API: users can access only their own selection and preference data; Admin/HR can access organization reports; named user lists and delegated audits should be narrowly permissioned.
4. Define the reporting calendar and completion semantics. ISO week/year conversion, time zone, active menu days, schedule status, and whether `PENDING` counts toward forecast each need one shared definition.
5. Add an `AnalyticsEvent` table or use an approved external analytics service for product-usage events. Keep operational reporting data separate from clickstream telemetry.
6. Add coverage and validation for `Meals.calories` and `foodCode`; report missing/invalid values instead of treating them as zero without disclosure.
7. Implement retention, deletion/anonymization, and access-audit policies before collecting telemetry or exporting personal data.

### Frontend

1. Replace mock data in `src/pages/Admin/Report/Report.tsx` with the weekly production API.
2. Add week/year and status filters, loading/empty/error states, and a visible “data last refreshed” timestamp.
3. Add CSV export before PDF as the operational interchange format. Keep PDF for printable summaries.
4. Use aggregated data by default. Reveal named users only within the incomplete-selection follow-up and delegated audit views.
5. Add the user's own taste-profile summary only after explaining its non-clinical purpose and providing a clear data/privacy notice.
6. Instrument the high-value events in the table above behind consent and environment configuration where policy requires it.

## Metric Definitions

Use these definitions consistently in the UI, exports, APIs, and tests.

| Metric | Definition |
| --- | --- |
| Eligible user | Active user who is not unavailable for the relevant meal day, subject to the agreed business rules |
| Submitted selection | A `Selections` row with `selectionStatus = SUBMITTED` |
| Daily portions | Count of submitted selections grouped by `menuDayId` and `dayMealId`, normally by recipient (`createdFor` when present, otherwise the selector) |
| Full weekly completion | Eligible user has one required submitted selection for every active meal day of the scheduled week |
| Completion rate | Full weekly completions divided by eligible users; show numerator and denominator |
| Meal share | Submitted selections for a meal divided by submitted selections available to the selected scope |
| Diversity score | `uniqueMeals / totalSelections * 100`, as calculated by `tasteProfileMetrics.ts` |
| Consistency score | `repeatedMeals / totalSelections * 100`, as calculated by `tasteProfileMetrics.ts` |
| Calorie coverage | Selected meals with a non-null calorie value divided by all selected meals in scope |

## Recommended Delivery Order

1. **Operational baseline:** role-protect the API, add the weekly production aggregate, connect the current report page, and export CSV/PDF for a selected week.
2. **Participation:** availability-adjusted incomplete-selection follow-up and weekly completion trend.
3. **Planning:** meal popularity, menu performance, and category-level food-code analysis.
4. **Personal insight:** user-only taste-profile screen and anonymous planner aggregates.
5. **Product telemetry:** approved event schema, consent/configuration, retention policy, dashboards, and alerts for workflow failures.

## Acceptance Criteria for the First Real Report

- An Admin/HR user can select a real calendar week and see live per-day/per-meal submitted counts.
- The total is generated on the server from the scheduled menu and selections, not frontend mock data.
- Pending selections are visibly separate from submitted counts.
- The report identifies incomplete eligible users without including users on approved leave.
- CSV and PDF exports contain the same filters, generation time, and metric definitions as the screen.
- A standard user cannot query another user's selections or an organization-level report.
- Tests cover empty weeks, incomplete selections, delegated selections, unavailable users, missing calorie values, and role authorization.

## Relevant Code Areas

| Area | Frontend | Backend |
| --- | --- | --- |
| Admin report | `src/pages/Admin/Report/Report.tsx` | New reporting route/controller/service recommended |
| Meal selection | `src/pages/SelectMeal/SelectMeal.tsx` | `src/routes/selectionRoutes.ts`, `src/services/mealSelectionService.ts` |
| Personal weekly activity | `src/pages/User/Activities.tsx` | Weekly user selection endpoint |
| Selection client API | `src/api/Services/MealSelectionServices.ts` | `src/controllers/mealSelectionController.ts` |
| Data model | N/A | `prisma/schema.prisma` |
| Taste analytics | `src/api/Services/TasteProfileServices.ts` | `src/helpers/tasteProfileMetrics.ts`, `src/services/tasteProfileService.ts` |
| Routing and roles | `src/router/index.tsx` | Authentication and authorization middleware to be added |
