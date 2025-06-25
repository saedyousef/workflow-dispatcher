import {DispatchHistoryEntry, Status, WorkflowPayload} from "./types.js";
import {loadFromLocalStorage, saveToLocalStorage, toggleLoader} from "./utils.js";
import {dispatchWorkflow, saveDispatchHistory} from "./workflow.js";
import {displayDispatchHistory} from "./dom.js";

const form = document.getElementById("dispatch-form") as HTMLFormElement;
const payloadContainer = document.getElementById("payload-container") as HTMLDivElement;
const addPayloadFieldButton = document.getElementById("add-payload-field") as HTMLButtonElement;
const savePatCheckbox = document.getElementById("save-pat") as HTMLInputElement;
const logHistoryCheckbox = document.getElementById("log-history") as HTMLInputElement;
const loader = document.querySelector(".loading-container") as HTMLDivElement;
const themeSwitch = document.getElementById("theme-switch") as HTMLInputElement;

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

    // Create the Remove Field button with tooltip
    const removeButton = document.createElement("button");
    removeButton.setAttribute("class", "tooltip");
    removeButton.type = "button";

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("fill", "none");
    svg.setAttribute("viewBox", "0 0 20 20");
    svg.setAttribute("height", "20");
    svg.setAttribute("width", "20");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "#0F172A");
    path.setAttribute("fill-rule", "evenodd");
    path.setAttribute("clip-rule", "evenodd");
    path.setAttribute(
        "d",
        "M8.75 1C7.23122 1 6 2.23122 6 3.75V4.1927C5.20472 4.26972 4.41602 4.36947 3.63458 4.49129C3.22531 4.5551 2.94525 4.9386 3.00906 5.34787C3.07286 5.75714 3.45637 6.0372 3.86564 5.97339L4.01355 5.95062L4.85504 16.4693C4.96938 17.8985 6.16254 19 7.59629 19H12.4035C13.8372 19 15.0304 17.8985 15.1447 16.4693L15.9862 5.95055L16.1346 5.97339C16.5438 6.0372 16.9274 5.75714 16.9912 5.34787C17.055 4.9386 16.7749 4.5551 16.3656 4.49129C15.5841 4.36946 14.7954 4.2697 14 4.19268V3.75C14 2.23122 12.7688 1 11.25 1H8.75ZM10.0001 4C10.8395 4 11.673 4.02523 12.5 4.07499V3.75C12.5 3.05964 11.9404 2.5 11.25 2.5H8.75C8.05964 2.5 7.5 3.05964 7.5 3.75V4.075C8.32707 4.02524 9.16068 4 10.0001 4ZM8.57948 7.72002C8.56292 7.30614 8.21398 6.98404 7.8001 7.0006C7.38622 7.01716 7.06412 7.36609 7.08068 7.77998L7.38069 15.28C7.39725 15.6939 7.74619 16.016 8.16007 15.9994C8.57395 15.9828 8.89605 15.6339 8.87949 15.22L8.57948 7.72002ZM12.9195 7.77998C12.936 7.36609 12.614 7.01715 12.2001 7.0006C11.7862 6.98404 11.4372 7.30614 11.4207 7.72002L11.1207 15.22C11.1041 15.6339 11.4262 15.9828 11.8401 15.9994C12.254 16.016 12.6029 15.6939 12.6195 15.28L12.9195 7.77998Z"
    );

    svg.appendChild(path);

    const span = document.createElement("span");
    span.setAttribute("class", "tooltiptext");
    span.textContent = "Remove";

    removeButton.appendChild(svg);
    removeButton.appendChild(span);
    removeButton.classList.add("remove-payload-field");

    // Add click event listener
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

        // Save log and refresh table
        saveDispatchHistory(logEntry);
        displayDispatchHistory(loadFromLocalStorage<DispatchHistoryEntry[]>("dispatch_history") || []);
    } catch (error) {
        console.error(error);
    } finally {
        toggleLoader(loader, form, false);
    }
});

// Load initial dispatch history
window.addEventListener("DOMContentLoaded", () => {
    displayDispatchHistory(loadFromLocalStorage<DispatchHistoryEntry[]>("dispatch_history") || []);
});
