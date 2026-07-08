# SWARM Command

SWARM Command is a proof-of-concept command application for a live public Instagram July 2026 police demonstration.

**SWARM** = Social Warning & Actor Risk Mapping  
**Tagline:** Detect the mob before it moves.

## Live Public Instagram July 2026 POC

The MVP accepts analyst-entered public Instagram artifacts from July 1, 2026 through July 31, 2026.

Included in scope:

- Public Instagram accounts only
- Public posts and reels
- Public captions and public comments
- Public hashtags
- Public location tags and mentioned locations
- Analyst-entered observations
- Analyst-captured screenshot/media placeholders
- Agency-provided public Instagram evidence

Excluded from scope:

- Private DMs
- Private accounts
- Follower-only content
- Device location
- IP logs
- Subscriber records
- Carrier data
- Password-protected content
- Fake account access
- Account compromise
- Session hijacking
- Facial recognition
- Automated identity confirmation
- Real-time phone tracking

## POC Workflow

```text
Watchlist -> Instagram Live Intake -> Instagram Signals Inbox -> Event Cluster -> Actor Mapping -> Evidence Locker -> Case Packet Export
```

## Current Capabilities

- Role-based demo login
- Global `Instagram / July 2026` scope banner
- Editable Instagram watchlist
- Live public Instagram intake form
- July 2026 scope validation
- Public Instagram URL and public handle validation
- Local mock hash generation
- Signal and evidence creation from intake
- Signal inbox filters and analyst actions
- Event cluster indicators
- Public account actor role assessments
- Evidence locker and integrity check action
- Case packet Markdown export
- Audit log
- POC Review Checklist with persistent state
- Settings controls for seed reset, JSON export/import, and checklist reset
- Browser localStorage persistence

## Product Guardrails

This POC does not perform scraping, automated Instagram login, private data collection, device tracking, identity confirmation, or facial recognition. It is designed for analyst-submitted public Instagram artifacts only.

Actor profiles must preserve this distinction:

```text
Public Instagram account assessment. Not confirmed legal identity unless legally confirmed.
```

Case packet exports include this disclaimer:

```text
SWARM Command generates intelligence leads, public-account role assessments, and evidence organization. Charging decisions remain with investigators, supervisors, and prosecutors.
```

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Notes

Seed records use placeholder public handles and URLs only:

- `@public_handle_001`
- `@public_handle_002`
- `@public_handle_003`
- `https://instagram.com/p/placeholder001`
- `https://instagram.com/reel/placeholder002`

They are labeled as placeholder records and should be replaced with analyst-entered public artifacts during the July 2026 POC.
