# Workflow Dispatcher

A simple web interface for triggering GitHub Actions workflows.

## Features

- Dispatch GitHub Actions workflows for any repository
- Add custom payload parameters dynamically
- Optional saving of Personal Access Token (PAT) in local storage
- Log and view dispatch history locally
- Light/Dark theme toggle
- View details for each dispatch in a modal
- Works entirely in the browser, no backend required

## Getting Started

Clone or download the repository and open `index.html` in your browser.  
To trigger workflows you need a GitHub PAT with `repo` and `workflow` scopes.

### Build

Source code is written in TypeScript. To compile run:

```bash
npx tsc
```

This produces JavaScript files in the `dist/` directory which are referenced by `index.html`.

### Usage

1. Enter the repository owner, name and workflow filename (e.g. `deploy.yml`).
2. Specify the branch (ref) you want to run the workflow on.
3. Enter your GitHub Personal Access Token.
4. Optionally add payload fields for the workflow inputs.
5. Click **Dispatch Workflow**.  
   Successful dispatches are stored in local storage and shown in the history table.

Use the **Add Payload** button to include additional workflow inputs.  
Enable **Save PAT** to persist the token locally for future sessions.  
Check **Log workflow dispatch** to keep a history of your dispatches which can be cleared at any time.

## Deployment

The repository is configured to compile TypeScript and deploy the site to GitHub Pages through the workflow located at `.github/workflows/compile.yml`.  
The CNAME file points to `workflow-dispatcher.saedyousef.com`.

## License

This project is released under the [Unlicense](LICENSE).
