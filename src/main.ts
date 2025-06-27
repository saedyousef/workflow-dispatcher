import {DispatchHistoryEntry, Status, WorkflowPayload} from "./types.js";
import {loadFromLocalStorage, saveToLocalStorage, toggleLoader} from "./utils.js";
import {dispatchWorkflow, saveDispatchHistory, clearDispatchHistory} from "./workflow.js";
import {displayDispatchHistory} from "./dom.js";

declare const MicroModal: any;

const form = document.getElementById("dispatch-form") as HTMLFormElement;
const payloadContainer = document.getElementById("payload-container") as HTMLDivElement;
const addPayloadFieldButton = document.getElementById("add-payload-field") as HTMLButtonElement;
const savePatCheckbox = document.getElementById("save-pat") as HTMLInputElement;
const logHistoryCheckbox = document.getElementById("log-history") as HTMLInputElement;
const loader = document.querySelector(".loading-container") as HTMLDivElement;
const themeSwitch = document.getElementById("theme-switch") as HTMLInputElement;
const clearHistoryButton = document.getElementById("clear-history") as HTMLButtonElement;
const confirmClearHistoryBtn = document.getElementById("confirm-clear-history-btn") as HTMLButtonElement;

const savedTheme = loadFromLocalStorage<string>("theme");
if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeSwitch.checked = true;
}

themeSwitch.addEventListener("change", () => {
    if (themeSwitch.checked) {
        document.body.classList.add("dark");
        saveToLocalStorage("theme", "dark");
    } else {
        document.body.classList.remove("dark");
        saveToLocalStorage("theme", "light");
    }
});

// Load saved PAT if available
const savedPat = loadFromLocalStorage<string>("github_pat");
if (savedPat) {
    (document.getElementById("pat") as HTMLInputElement).value = savedPat;
    savePatCheckbox.checked = true;
}

// Load log history preference
const savedLogPref = loadFromLocalStorage<boolean>("log_history_enabled");
if (savedLogPref) {
    logHistoryCheckbox.checked = true;
}

logHistoryCheckbox.addEventListener("change", () => {
    if (logHistoryCheckbox.checked) {
        saveToLocalStorage("log_history_enabled", true);
    } else {
        localStorage.removeItem("log_history_enabled");
    }
});

// Add payload field dynamically
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
    removeButton.className = "btn-action remove remove-payload-field";
    removeButton.textContent = "\u00d7";
    removeButton.setAttribute("aria-label", "Remove payload");
    removeButton.addEventListener("click", () => fieldDiv.remove());

    fieldDiv.append(keyInput, valueInput, removeButton);
    payloadContainer.appendChild(fieldDiv);
});

// Handle form submission
form.addEventListener("submit", async (event) => {
    event.preventDefault();
    toggleLoader(loader, form, true);

    const owner = (document.getElementById("owner") as HTMLInputElement).value;
    const repo = (document.getElementById("repo") as HTMLInputElement).value;
    const workflow = (document.getElementById("workflow") as HTMLInputElement).value;
    const ref = (document.getElementById("ref") as HTMLInputElement).value;
    const pat = (document.getElementById("pat") as HTMLInputElement).value;

    const payload: WorkflowPayload = {};
    payloadContainer.querySelectorAll(".payload-field").forEach((field) => {
        const key = (field.querySelector(".payload-key") as HTMLInputElement).value;
        payload[key] = (field.querySelector(".payload-value") as HTMLInputElement).value;
    });

    // Save PAT if the checkbox is checked
    if (savePatCheckbox.checked) {
        saveToLocalStorage("github_pat", pat);
    } else {
        localStorage.removeItem("github_pat");
    }

    try {
        const response = await dispatchWorkflow(owner, repo, workflow, ref, pat, payload);
        const logEntry: DispatchHistoryEntry = {
            owner,
            repo,
            workflow,
            ref,
            payload,
            timestamp: new Date().toISOString(),
            status: response.ok ? Status.Success : Status.Failure,
            errorMessage: response.ok ? null : "Workflow dispatch failed.",
        };

        // Save log and refresh table if enabled
        if (logHistoryCheckbox.checked) {
            saveDispatchHistory(logEntry);
        }
        displayDispatchHistory(loadFromLocalStorage<DispatchHistoryEntry[]>("dispatch_history") || []);
    } catch (error) {
        console.error(error);
    } finally {
        toggleLoader(loader, form, false);
    }
});

// Load initial dispatch history
window.addEventListener("DOMContentLoaded", () => {
    displayDispatchHistory(
        loadFromLocalStorage<DispatchHistoryEntry[]>("dispatch_history") || []
    );

    const savedTheme = loadFromLocalStorage<string>("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
        if (themeSwitch) {
            themeSwitch.checked = true;
        }
    }

    if (typeof MicroModal !== "undefined") {
        MicroModal.init();
    }
});

if (clearHistoryButton) {
    clearHistoryButton.addEventListener("click", () => {
        if (typeof MicroModal !== "undefined") {
            MicroModal.show("confirm-clear-history");
        }
    });
}

if (confirmClearHistoryBtn) {
    confirmClearHistoryBtn.addEventListener("click", () => {
        clearDispatchHistory();
        displayDispatchHistory([]);
        if (typeof MicroModal !== "undefined") {
            MicroModal.close("confirm-clear-history");
        }
    });
}
