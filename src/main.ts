/**
 * Created by yousef on 12/23/2024 at 2:50 PM
 * Description: main
 */
type WorkflowPayload = Record<string, string>;
type DispatchHistory = {
    owner: string;
    repo: string;
    workflow: string;
    ref: string;
    payload: WorkflowPayload;
    timestamp: string;
}[];

const form = document.getElementById("dispatch-form") as HTMLFormElement;
const statusElement = document.getElementById("status") as HTMLElement;
const payloadContainer = document.getElementById("payload-container") as HTMLDivElement;
const addPayloadFieldButton = document.getElementById("add-payload-field") as HTMLButtonElement;
const savePatCheckbox = document.getElementById("save-pat") as HTMLInputElement;
const logHistoryCheckbox = document.getElementById("log-history") as HTMLInputElement;

// Load saved PAT if available
const savedPat = localStorage.getItem("github_pat");
if (savedPat) {
    (document.getElementById("pat") as HTMLInputElement).value = savedPat;
    savePatCheckbox.checked = true;
}

// Add dynamic input fields for the payload
addPayloadFieldButton.addEventListener("click", () => {
    const fieldDiv = document.createElement("div");
    fieldDiv.className = "payload-field";

    const keyInput = document.createElement("input");
    keyInput.type = "text";
    keyInput.placeholder = "Key";
    keyInput.required = true;
    keyInput.className = "payload-key";

    const valueInput = document.createElement("input");
    valueInput.type = "text";
    valueInput.placeholder = "Value";
    valueInput.required = true;
    valueInput.className = "payload-value";

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.classList.add("primary-button");
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => fieldDiv.remove());

    fieldDiv.appendChild(keyInput);
    fieldDiv.appendChild(valueInput);
    fieldDiv.appendChild(removeButton);
    payloadContainer.appendChild(fieldDiv);
});

// Handle form submission
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Extract form values
    const owner = (document.getElementById("owner") as HTMLInputElement).value;
    const repo = (document.getElementById("repo") as HTMLInputElement).value;
    const workflow = (document.getElementById("workflow") as HTMLInputElement).value;
    const ref = (document.getElementById("ref") as HTMLInputElement).value;
    const pat = (document.getElementById("pat") as HTMLInputElement).value;

    const payload: WorkflowPayload = {};
    const payloadFields = payloadContainer.querySelectorAll(".payload-field");
    payloadFields.forEach((field) => {
        const key = (field.querySelector(".payload-key") as HTMLInputElement).value;
        payload[key] = (field.querySelector(".payload-value") as HTMLInputElement).value;
    });

    // Save PAT if the checkbox is checked
    if (savePatCheckbox.checked) {
        localStorage.setItem("github_pat", pat);
    } else {
        localStorage.removeItem("github_pat");
    }

    // Dispatch the workflow
    const response = await dispatchWorkflow(owner, repo, workflow, ref, pat, payload);

    if (response.ok) {
        statusElement.textContent = "Workflow dispatched successfully!";

        // Log history if the checkbox is checked
        if (logHistoryCheckbox.checked) {
            saveDispatchHistory({ owner, repo, workflow, ref, payload });
        }
    } else {
        const errorText = await response.text();
        statusElement.textContent = `Error: ${response.status} - ${errorText}`;
    }
});

// Save dispatch history to local storage
function saveDispatchHistory(dispatch: {
    owner: string;
    repo: string;
    workflow: string;
    ref: string;
    payload: WorkflowPayload;
}) {
    const history: DispatchHistory = JSON.parse(localStorage.getItem("dispatch_history") || "[]");
    history.push({
        ...dispatch,
        timestamp: new Date().toISOString(),
    });
    localStorage.setItem("dispatch_history", JSON.stringify(history));
}

// Dispatch the workflow
async function dispatchWorkflow(
    owner: string,
    repo: string,
    workflow: string,
    ref: string,
    pat: string,
    payload: WorkflowPayload
): Promise<Response> {
    const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow}/dispatches`;

    const headers = {
        "Content-Type": "application/json",
        Authorization: `token ${pat}`,
        Accept: "application/vnd.github.v3+json",
    };

    const body = JSON.stringify({
        ref,
        inputs: payload,
    });

    return fetch(url, {
        method: "POST",
        headers,
        body,
    });
}
