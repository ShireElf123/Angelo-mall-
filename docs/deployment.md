# Deployment notes — Angelo Mall Go

Project: **`angelo-mall-go`** (`prj_mpPJGHcdFa78ooJNibmfn5NOSdM6`), team *mercel's projects*
(`team_bEBj6fDiWp6GJSYyI8cmGjVS`), framework Vite, install `npm ci`, build `npm run build`,
output `dist/`.

## Current state (verified 2026-10-27)

| Item | Value |
| --- | --- |
| Git-integration | **Not connected.** The project object has no `link`; `gitProviderOptions.createDeployments` is `"disabled"` and `disableRepositoryDispatchEvents` is `true`. |
| Effect | A push does not itself trigger a Vercel build. Deployment is done by the repository's GitHub Actions workflow instead (below). |
| How Previews are produced today | **GitHub Actions** on every push to `arena/aeeb5cff-angelo-mall`: `npm ci` → `npm test` → `npm run build` → Vercel CLI prebuilt Preview. Manual API/Git-sourced Previews (`target: staging`) are still possible as a fallback. |
| Production | Never deployed deliberately. One Production-targeted deployment was created by mistake in Phase 1 and cancelled immediately; it was never aliased. |
| Access protection | Vercel SSO protection is **on** (`all_except_custom_domains`). Anonymous fetches redirect to the Vercel login page. Keep it on. |
| Domain mapping | `angelo-mall-go.vercel.app` is mapped to the `arena/aeeb5cff-angelo-mall` branch. Do not change it without the owner's sign-off. |
| Social preview tags | `index.html` hard-codes absolute `og:url` / `og:image` / `twitter:image` URLs on `https://angelo-mall-go.vercel.app/` because crawlers do not resolve relative paths. If that domain ever changes, update those tags in the same change. |

Known-good Preview history (all READY, retained as rollback points):

| Deployment | Commit | Notes |
| --- | --- | --- |
| `dpl_8uqrcDjtFEJnDw7jEDBkJ2c3FFen` | `2eabb05` | Batch 8 ten photographic-style per-tenant concept images — CI-deployed Preview, READY |
| `dpl_6UtMWjRigbrzQgFnzS8DjoEF9JoS` | `4b235e6` | Batch 7 ten per-tenant concept illustrations — CI-deployed Preview, READY |
| `dpl_2jaxwy3jpAhzT8faFtwd3P35j1kx` | `87d2328` | Batch 6 asset/visual audit (no new images) — CI-deployed Preview, READY |
| `dpl_HYEM95nMWi9qMzgaMTBK76aboYLe` | `0e383aa` | Batch 5 artwork (10 gap-audit state illustrations) — CI-deployed Preview, READY |
| `dpl_HPHhvZn8wfswzUtaFrveARTYw7YT` | `774dbd9` | Batch 4 artwork (10 journey/state illustrations) — CI-deployed Preview, READY |
| `dpl_7Sc796NRx4QjSTuX5nT1it852HaZ` | `f4f6e0a` | Batch 3 artwork (10 discovery illustrations) — CI-deployed Preview, READY |
| `dpl_296NVBMoB4S64TQgdXWGc1KdvuYd` | `9083754` | Batch 2 artwork (10 images wired in) — CI-deployed Preview, READY |
| `dpl_EVF1TaCkGwhHNNmaW1Jv1SozbBLS` | `79b41c3` | Phase 5 logo system + image assets — first CI-deployed Preview, READY |
| `dpl_DHzRhyqhtcckgpWPXxHtxSdVNsDJ` | `d5b07c7` | CI workflow fix (first successful CI run) |
| `dpl_7NQnQgXrxYzx1JbeJdCeCs9x1HEB` | `0a403be` | Phase 4 real tenant directory (manual API Preview) |
| `dpl_5tSwmVFqhXq9284WxJSH9ez8qCza` | `0a66ab2` | Phase 3 deployment docs |
| `dpl_PHw5TrfMg8ruD5w5JejfnQnDBVJm` | `227e696` | Phase 3 chat UX fixes + tenant onboarding doc |
| `dpl_5MscSd3qE3bExrtg9VMqvr4YGWAY` | `30cb6c0` | Phase 2 expandable chat + wordmarks |
| `dpl_Fw2bur9shv6j2TvSfEPAfGhgMfqS` | `56db4a7` | Phase 1 final |

## Push-to-Preview automation (GitHub Actions)

A repository workflow exists at `.github/workflows/vercel-preview.yml`. It runs only when
`arena/aeeb5cff-angelo-mall` is pushed (or manually started), runs `npm ci`, `npm test` and
`npm run build`, then uses the Vercel CLI to publish a prebuilt deployment. It never passes
`--prod`. The repository secret **`verceltoken`** is configured, so pushes now deploy
automatically.

**Verified working (2026-10-27, Phase 5).** Run
[`40410613499`](https://github.com/ShireElf123/Angelo-mall-/actions/runs/40410613499) for
commit `79b41c3383cc2afb8400f411d919fbe5aee67f74`: all steps green (install, tests,
typecheck+build, Vercel pull, Vercel build, deploy) and the resulting deployment
`dpl_EVF1TaCkGwhHNNmaW1Jv1SozbBLS` reached **READY** with `githubCommitSha` matching the
pushed commit. Preview URL:
<https://angelo-mall-dpn5pwfob-mercels-projects-80f68ab7.vercel.app>.

**Batch 10 re-verified (2026-10-27).** Run
[`40465350543`](https://github.com/ShireElf123/Angelo-mall-/actions/runs/40465350543) for
commit `f036824177bb6fa2f436a02bc396057c343a7da3`: install, tests (265 passing, 30 files),
typecheck + build, Vercel pull/build and the Preview deploy were all green, and the Git
deployment `dpl_4mfnttgvfBknCZDCnyphz8cxghzx` reached **READY** with a matching
`githubCommitSha`. Preview:
<https://angelo-mall-rfxitxedy-mercels-projects-80f68ab7.vercel.app>. Batch 10 replaced the
ten batch 7 still-life hero images with researched interiors at the same file paths, so the
manifest total stayed at 92 while ten entries moved to batch 10 and gained a `revision`
block. Test count rose by one (the new replacement-record guard). As before, the deployment's
`GET /v6/deployments/{id}/files` returns 404, so the green run plus the matching SHA are the
verification, and SSO-blocked page-load was not attempted.

**Batch 9 re-verified (2026-10-27).** Run
[`40463461159`](https://github.com/ShireElf123/Angelo-mall-/actions/runs/40463461159) for
commit `1dc263b9488e76e99ab5c9b33df9202f136a5a72`: install, tests (264 passing, 30 files),
typecheck + build, Vercel pull/build and the Preview deploy were all green, and
`dpl_7mHZrD8kVRBv7rq8GGUd6GAvsAKM` is **READY** with a matching `githubCommitSha`. Preview:
<https://angelo-mall-4lh50rtu2-mercels-projects-80f68ab7.vercel.app>. Batch 9 added the last
nine tenant concept images (tenants 21–29) and wired every remaining `conceptImage`, so the
manifest now holds 92 assets and 29 tenant heroes; the test count rose by one because the
shop-page cover-fallback test now builds its own no-art seed instead of relying on a tenant
that lacked art. As before, the deployment's `GET /v6/deployments/{id}/files` returns 404, so
the green build log and the matching SHA are the verification, and SSO-blocked page-load was
not attempted.

**Batch 8 re-verified (2026-10-27).** Run
[`40461084358`](https://github.com/ShireElf123/Angelo-mall-/actions/runs/40461084358) for
commit `2eabb05cca5e9ff048da4712f3308d387880d06e`: install, tests (263 passing), typecheck +
build, Vercel pull/build and the Preview deploy were all green, and
`dpl_8uqrcDjtFEJnDw7jEDBkJ2c3FFen` is **READY** with a matching `githubCommitSha`. Preview:
<https://angelo-mall-z0epm9twi-mercels-projects-80f68ab7.vercel.app>. Note: the three commits
before this one (`5149d89`, `dd87aea`, `930fae1`, `29ff5e5`) landed with **failing** CI (runs
`40459103564`, `40459117930`, `40459530448`, `40459797627`) because two logo tests still assumed
an empty registry after the hosted-logo change; batch 8 repaired them, so `2eabb05` is the first
green run since.

**Batch 7 re-verified (2026-10-27).** Run
[`40453908629`](https://github.com/ShireElf123/Angelo-mall-/actions/runs/40453908629) for
commit `4b235e671603b97e3b01a8ef8d8979ea036d6742`: install, tests (263 passing), typecheck +
build, Vercel pull/build and the Preview deploy were all green, and
`dpl_6UtMWjRigbrzQgFnzS8DjoEF9JoS` is **READY** with a matching `githubCommitSha`. Preview:
<https://angelo-mall-jqyas2ik3-mercels-projects-80f68ab7.vercel.app>.

**Batch 6 re-verified (2026-10-27).** Run
[`40450957521`](https://github.com/ShireElf123/Angelo-mall-/actions/runs/40450957521) for
commit `87d23280a7447a9879e0a3c4f0b475ecc28badd8`: install, tests (255 passing), typecheck +
build, Vercel pull/build and the Preview deploy were all green, and
`dpl_2jaxwy3jpAhzT8faFtwd3P35j1kx` is **READY** with a matching `githubCommitSha`. Preview:
<https://angelo-mall-6jx6okww8-mercels-projects-80f68ab7.vercel.app>. Batch 6 generated no
images; it audited the existing 63 and fixed contrast, aspect-ratio, manifest and social-tag
issues in code.

**Batch 5 re-verified (2026-10-27).** Run
[`40449367058`](https://github.com/ShireElf123/Angelo-mall-/actions/runs/40449367058) for
commit `0e383aa21b29ad97dc9416fc92f78bdb6af1fd80`: install, tests (255 passing), typecheck +
build, Vercel pull/build and the Preview deploy were all green, and
`dpl_HYEM95nMWi9qMzgaMTBK76aboYLe` is **READY** with a matching `githubCommitSha`. Preview:
<https://angelo-mall-dwp3ohaqa-mercels-projects-80f68ab7.vercel.app>.

**Batch 4 re-verified (2026-10-27).** Run
[`40447459943`](https://github.com/ShireElf123/Angelo-mall-/actions/runs/40447459943) for
commit `774dbd9fb1c3230fac1d733db08e44c755dcb2b3`: install, tests (218 passing), typecheck +
build, Vercel pull/build and the Preview deploy were all green, and
`dpl_HPHhvZn8wfswzUtaFrveARTYw7YT` is **READY** with a matching `githubCommitSha`. Preview:
<https://angelo-mall-50jxhilk6-mercels-projects-80f68ab7.vercel.app>.

**Batch 3 re-verified (2026-10-27).** Run
[`40414459959`](https://github.com/ShireElf123/Angelo-mall-/actions/runs/40414459959) for
commit `f4f6e0a3a5e4d36970d091bb26beb8a37525c2c7`: install, tests (178 passing), typecheck +
build, Vercel pull/build and the Preview deploy were all green, and
`dpl_7Sc796NRx4QjSTuX5nT1it852HaZ` is **READY** with a matching `githubCommitSha`. Preview:
<https://angelo-mall-awyjwrtjn-mercels-projects-80f68ab7.vercel.app>.

**Batch 11 verified (2026-10-27).** Run
[`40466917208`](https://github.com/ShireElf123/Angelo-mall-/actions/runs/40466917208) for commit
`49f216656ad25b0e2e96c3c7089c11704bbfd30d`: install, tests, typecheck + build, Vercel pull/build and
the Preview deploy were all green, and `dpl_CuNK625UbUCmqQSrA5EMMnfVA7jw` (`angelo-mall-go`) is
**READY** with a matching `githubCommitSha`. Preview:
<https://angelo-mall-l73wxjvqk-mercels-projects-80f68ab7.vercel.app>. The legacy `angelo-mall`
project also built the same commit as `dpl_CKwGE7nQ93ZJ6VsVg5rAgSojHzbK`, READY. Both remain
SSO-protected, so this is a status-and-SHA check, not a rendered-page check.

**Batch 2 re-verified (2026-10-27).** Run
[`40413068684`](https://github.com/ShireElf123/Angelo-mall-/actions/runs/40413068684) for
commit `908375497c9226174d7765dc0d97416df7063adf`: install, tests (148 passing), typecheck +
build, Vercel pull/build and the Preview deploy were all green, and
`dpl_296NVBMoB4S64TQgdXWGc1KdvuYd` is **READY** with a matching `githubCommitSha`. Preview:
<https://angelo-mall-g5nbujpae-mercels-projects-80f68ab7.vercel.app>. The older `angelo-mall`
project (a separate Vercel project with its own Git link) also built the same commit as
`dpl_B2gFseK4CEvXVaq8ABcjDUhVmi7E`, READY; the CI-deployed `angelo-mall-go` deployment above is
the one to review.

Two facts worth remembering about CLI-made deployments:

* They report `"target": null` in the API, unlike API-created Previews (`"target": "staging"`).
  Do **not** read that as Production. The authoritative check is
  `GET /v6/deployments?target=production`: as of 2026-10-27 the only production-scoped
  deployment is the Phase 1 `dpl_8qGfZ9YwaT2PWrrBMHJg2JsSoykS`, which is **CANCELED**.
* `meta.gitDirty` is `"1"` because the workflow builds `dist/` during the run. It reflects
  the CI workspace, not uncommitted source.

To re-run: push to the branch, or Actions → **Vercel Preview (feature branch)** →
**Run workflow** → branch `arena/aeeb5cff-angelo-mall`. Verify the run is green and the
deployment references the pushed SHA. If it fails, inspect the failing step; do not switch
to Production or disable SSO.

The Vercel project IDs are stored as non-secret workflow environment variables. The native
Vercel Git integration remains disconnected/disabled; this workflow is a separate route.

## Optional: native Vercel Git integration

If you later prefer Vercel's built-in deployment integration instead, these are the
owner-controlled dashboard steps. They are not required for the GitHub Actions workflow:

1. **GitHub** → Settings → Applications → *Vercel* → Configure → Repository access →
   grant access to `ShireElf123/Angelo-mall-`.
2. **Vercel** → team *mercel's projects* → project **angelo-mall-go** → **Settings → Git** →
   *Connect Git Repository* → GitHub → `ShireElf123/Angelo-mall-`.
3. Set **Production Branch** deliberately. Do **not** leave it pointing at a demo branch:
   a push to the production branch deploys to Production. `main` is the safe choice, and
   it currently holds no Mall Go production release.
4. Enable **Git deployments** ("Deploy on push"). Leave *Ignored Build Step* empty.
5. **Verify**: push a trivial commit to a non-production branch, then confirm a new
   deployment appears in *Deployments* with that commit SHA, `target` empty/preview, and a
   Preview URL. Only after that should anyone claim auto-deploy works.

## Manual Preview deploy (what we do until then)

1. Push the commit to `arena/aeeb5cff-angelo-mall`.
2. Create a deployment with `target: staging` (the API's preview target), Git source
   `{type: github, repoId: 1434240179, ref: <branch>, sha: <full 40-char sha>}`.
3. Confirm `ready_state: READY`, and check the build log line
   `Cloning github.com/ShireElf123/Angelo-mall- (Branch: …, Commit: <short sha>)`
   matches the intended commit.
4. Record the deployment ID and URL in this file.

Notes and gotchas:

- `target: null` is treated as **Production**. Never omit the target.
- `target: "preview"` is rejected by the API (`'production' | 'staging' | custom`).
  Preview deployments report `target: "staging"` and carry
  `oidcTokenClaims.environment: "preview"`.
- The short SHA is rejected in `git_source.sha`; always pass the full SHA.
- `GET /v6/deployments/{id}/files` returns 404 for this project, so the build log is the
  source of truth for what was produced.
- Vercel SSO blocks anonymous browser testing; keep it enabled and verify while signed in.
