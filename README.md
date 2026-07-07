# Ujima AI PRIDE

Ethical AI-powered loan assessment demo for African SACCOs. The app includes:

- A static frontend loan application form
- An Express API for loan decisions and audit logs
- Scout, Guardian, and Hunter agent flows
- Analytics and fairness dashboards backed by the audit log
- Explainable Guardian scoring with livelihood, harvest timing, loan size, and repayment-capacity factors

## Run Locally

```bash
npm install
npm start
```

Open `http://localhost:5000`.

## API

- `GET /api/health` checks whether the backend is running.
- `POST /api/loan` evaluates a loan application and writes an audit log.
- `POST /api/scout` returns financial coaching guidance.
- `GET /api/logs` returns audit log entries for the dashboards.

## Guardian Scoring

Loan decisions use a transparent rules-based model:

- Livelihood context recognizes informal economy roles such as farmers, traders, and market vendors.
- Harvest timing simulates seasonal repayment advantages and risks.
- Loan size checks whether the requested amount is within a lower-risk band.
- Repayment capacity compares estimated monthly repayment with declared monthly income.

The API returns a decision, score, estimated monthly repayment, scoring factors, and a recommended next step.

## Deployment Notes

Set the Render start command to:

```bash
npm start
```

If Zapier notifications are needed, add `ZAPIER_WEBHOOK_URL` as an environment variable in the hosting platform. The webhook URL is intentionally not hard-coded in the repository.
