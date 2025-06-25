import { Status } from "./types.js";
import { loadFromLocalStorage, saveToLocalStorage, toggleLoader } from "./utils.js";
import { dispatchWorkflow, saveDispatchHistory } from "./workflow.js";
import { displayDispatchHistory } from "./dom.js";
const form = document.getElementById("dispatch-form");
const payloadContainer = document.getElementById("payload-container");
const addPayloadFieldButton = document.getElementById("add-payload-field");
const savePatCheckbox = document.getElementById("save-pat");
const logHistoryCheckbox = document.getElementById("log-history");
const loader = document.querySelector(".loading-container");
const themeSwitch = document.getElementById("theme-switch");
const savedTheme = loadFromLocalStorage("theme");
if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeSwitch.checked = true;
}
themeSwitch.addEventListener("change", () => {
    if (themeSwitch.checked) {
        document.body.classList.add("dark");
        saveToLocalStorage("theme", "dark");
    }
    else {
        document.body.classList.remove("dark");
        saveToLocalStorage("theme", "light");
    }
});
// Load saved PAT if available
const savedPat = loadFromLocalStorage("github_pat");
if (savedPat) {
    document.getElementById("pat").value = savedPat;
    savePatCheckbox.checked = true;
}
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
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => fieldDiv.remove());
    fieldDiv.append(keyInput, valueInput, removeButton);
    payloadContainer.appendChild(fieldDiv);
});
// Handle form submission
form.addEventListener("submit", async (event) => {
    event.preventDefault();
    toggleLoader(loader, form, true);
    const owner = document.getElementById("owner").value;
    const repo = document.getElementById("repo").value;
    const workflow = document.getElementById("workflow").value;
    const ref = document.getElementById("ref").value;
    const pat = document.getElementById("pat").value;
    const payload = {};
    payloadContainer.querySelectorAll(".payload-field").forEach((field) => {
        const key = field.querySelector(".payload-key").value;
        payload[key] = field.querySelector(".payload-value").value;
    });
    // Save PAT if the checkbox is checked
    if (savePatCheckbox.checked) {
        saveToLocalStorage("github_pat", pat);
    }
    else {
        localStorage.removeItem("github_pat");
    }
    try {
        const response = await dispatchWorkflow(owner, repo, workflow, ref, pat, payload);
        const logEntry = {
            owner,
            repo,
            workflow,
            ref,
            payload,
            timestamp: new Date().toISOString(),
            status: response.ok ? Status.Success : Status.Failure,
            errorMessage: response.ok ? null : "Workflow dispatch failed.",
        };
        // Save log and refresh table
        saveDispatchHistory(logEntry);
        displayDispatchHistory(loadFromLocalStorage("dispatch_history") || []);
    }
    catch (error) {
        console.error(error);
    }
    finally {
        toggleLoader(loader, form, false);
    }
});
// Load initial dispatch history
window.addEventListener("DOMContentLoaded", () => {
    displayDispatchHistory(loadFromLocalStorage("dispatch_history") || []);
    const savedTheme = loadFromLocalStorage("theme");
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
