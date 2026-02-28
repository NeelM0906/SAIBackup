# GIT WORKFLOW — Branch + PR Protocol

## Rules (Effective Feb 28, 2026)

### NEVER push directly to `main`. Always use branches + PRs.

### Branch Naming
Each sister uses her own prefix:
- `prime/` — Sai Prime (dashboards, reports, coordination)
- `forge/` — Forge (colosseum, battles, evolution)
- `scholar/` — Scholar (research, knowledge, judges)
- `memory/` — Memory (pinecone, archives, translator)
- `recovery/` — Recovery (CRM, contacts, outreach)

### Format
```
<sister>/za-<number>-<short-description>
```

Examples:
- `prime/za-19-landing-pages`
- `forge/za-13-model-bakeoff`
- `recovery/za-2-geo-segmentation`

### Workflow
1. `git checkout main && git pull origin main`
2. `git checkout -b <branch-name>`
3. Do your work, commit often
4. `git push origin <branch-name>`
5. Create PR on GitHub (or let Prime merge after review)
6. **DO NOT merge your own PR** — Prime reviews and merges

### Merge Conflicts
- Pull main BEFORE starting any branch
- Keep branches short-lived (hours, not days)
- If conflict occurs, rebase on main: `git rebase main`

### Emergency Hotfix
If something is broken in production:
- Branch: `hotfix/<description>`
- Prime can merge immediately without review

### Dashboard Repo (colosseum-dashboard)
- Same rules apply
- Prime owns deploys to Vercel
- No one else runs `vercel --prod`
