## Competitive Intelligence demo script (Phase 6)

This is a short, repeatable walkthrough you can run live in ~5 minutes.

### Prereqs

Backend (in `competitive-os/backend`):

```bash
source .venv/bin/activate
python seed.py
uvicorn main:app --reload --port 8001
```

Frontend (in `competitive-os/frontend`):

```bash
npm run dev
```

Open the app (Vite prints the URL, e.g. `http://localhost:5177/`).

---

### Scenario 1 — CSO Monday brief (90 seconds)

- Select **SC** (Sarah Chen) in the sidebar account switcher.
- Go to `/` (Dashboard).
- Call out the top exposure:
  - Seed is anchored on **Euro 7 + CO₂ compliance** (`init-euro7-co2-compliance`)
  - The score should be high (near ~8/10) after recompute.

---

### Scenario 2 — Initiative drill-down with evidence (60–90 seconds)

- Open `/initiatives/init-euro7-co2-compliance`
- Show:
  - Top contributing signals (from graph edges)
  - Trace payload (Phase 4+ visualization can be re-added; evidence is present)

---

### Scenario 3 — CEO landscape view (60–90 seconds)

- Select **VC** (Vic Chynoweth) in the sidebar account switcher.
- Go to `/` again.
- Walk through:
  - Market shift cards
  - Competitor archetypes (Planview / ServiceNow / Planisware / Jira Align)
  - CEO strategic vectors

---

### Scenario 4 — Network explorer sanity (60 seconds)

- Go to `/network`
- Demo filters:
  - Timeline slider (7–90 days)
  - Type chips (toggle `capability` on)
  - Search “euro”

