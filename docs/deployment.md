# Deployment notes — Angelo Mall Go

Project: **`angelo-mall-go`** (`prj_mpPJGHcdFa78ooJNibmfn5NOSdM6`), team *mercel's projects*
(`team_bEBj6fDiWp6GJSYyI8cmGjVS`), framework Vite, install `npm ci`, build `npm run build`,
output `dist/`.

## Current state (verified 2026-10-26)

| Item | Value |
| --- | --- |
| Git-integration | **Not connected.** The project object has no `link`; `gitProviderOptions.createDeployments` is `"disabled"` and `disableRepositoryDispatchEvents` is `true`. |
| Effect | Pushes to `arena/aeeb5cff-angelo-mall` do **not** create deployments. Verified empirically: push `227e696` produced no deployment until one was requested manually. |
| How Previews are produced today | Manual, Git-sourced deployments against a specific commit SHA (matching branch, `target: staging`). |
| Production | Never deployed deliberately. One Production-targeted deployment was created by mistake in Phase 1 and cancelled immediately; it was never aliased. |
| Access protection | Vercel SSO protection is **on** (`all_except_custom_domains`). Anonymous fetches redirect to the Vercel login page. Keep it on. |
| Domain mapping | `angelo-mall-go.vercel.app` is mapped to the `arena/aeeb5cff-angelo-mall` branch. Do not change it without the owner's sign-off. |

Known-good Preview history (all READY, retained as rollback points):

| Deployment | Commit | Notes |
| --- | --- | --- |
| `dpl_PHw5TrfMg8ruD5w5JejfnQnDBVJm` | `227e696` | Phase 3 chat UX fixes + tenant onboarding doc |
| `dpl_5MscSd3qE3bExrtg9VMqvr4YGWAY` | `30cb6c0` | Phase 2 expandable chat + wordmarks |
| `dpl_Fw2bur9shv6j2TvSfEPAfGhgMfqS` | `56db4a7` | Phase 1 final |

## Push-to-Preview automation (GitHub Actions)

A repository workflow now exists at `.github/workflows/vercel-preview.yml`. It runs only
when `arena/aeeb5cff-angelo-mall` is pushed (or manually started), runs `npm ci`, tests,
and `npm run build`, then uses the Vercel CLI to create a Preview deployment. It does not
use `--prod`, does not promote Production, and does not require connecting Vercel's native
Git integration. The workflow is committed, but it will not deploy until the repository
secret `VERCEL_TOKEN` is configured by the owner.

To finish setup:

1. In Vercel, create a token with access to team *mercel's projects* and project
   `angelo-mall-go`; keep it private and do not paste it into chat or commit it to the repo.
2. In GitHub, open `ShireElf123/Angelo-mall-` → Settings → Secrets and variables → Actions
   → New repository secret. Name it exactly `VERCEL_TOKEN` and paste the token value.
3. Open the repository Actions tab, select **Vercel Preview (feature branch)**, and run it
   with **Run workflow** on `arena/aeeb5cff-angelo-mall`, or push the next code commit to
   that branch. The workflow will test/build first, then publish a Preview only.
4. Verify the run is green and the resulting Vercel deployment references the pushed SHA.
   If it fails, inspect the failing step; do not switch to Production or disable SSO.

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
