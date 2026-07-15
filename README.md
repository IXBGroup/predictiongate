# PredictionGate

PredictionGate is a static MVP website for a prediction-market newsletter company. It uses HTML5, CSS3, vanilla JavaScript, and JSON demonstration data. There is no build step.

## Preview locally

Open `index.html` directly in a browser, or serve the folder with a small local server:

```powershell
python -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.

## Publish a new brief

1. Duplicate `brief.html` and rename it, for example `brief-2026-07-15.html`.
2. Update the page title, meta description, canonical URL, Open Graph tags, Twitter tags, article schema, headline, date, reading time, and article body.
3. Add links to the new issue from the homepage, the previous issue, and any future archive page.
4. Keep demonstration probabilities clearly labeled unless the issue uses verified live data and sourcing.

## Edit market data

Update `data/markets.json`. Each market needs:

- `id`
- `question`
- `probability`
- `move`
- `platform`
- `category`
- `updated`

The homepage shows the first six records. The markets page loads the full file and supports search, category filter, platform filter, and sorting.

## Connect a newsletter provider

Open `js/main.js` and replace this line:

```js
const NEWSLETTER_FORM_ACTION = "";
```

Use the form endpoint from Beehiiv, Kit, Substack, Mailchimp, or another provider. Adjust the request body in `setupSignupForms()` if the provider expects a different format. Until that URL is set, the form shows a clear demo message and does not pretend to save addresses.

## Deploy with GitHub Pages

1. Create a GitHub repository.
2. Upload these files or push the project with Git.
3. Open repository **Settings**.
4. Open **Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select the `main` branch.
7. Select the root folder.
8. Save the settings and wait for GitHub Pages to publish.
9. Add the custom domain `prediction-gate.com`.
10. Configure DNS with your domain provider using GitHub Pages' current DNS instructions.
11. Enable HTTPS after DNS is verified.

The `CNAME` file already contains `prediction-gate.com`.

## External accounts and future integrations

This MVP still needs external accounts or live APIs for:

- Newsletter signup provider
- Analytics or newsletter tracking
- Live prediction-market, event-contract, or forecasting-platform data
- Social accounts and RSS publication workflow
- Legal review of the privacy page and disclaimer before production launch
