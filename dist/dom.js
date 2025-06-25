/**
 * Created by yousef on 12/27/2024 at 4:30 PM
 * Description: dom.ts
 */
/**
 * DOM Manipulation Functions
 */
export function displayDispatchHistory(history) {
    const historyTableBody = document.querySelector("#dispatch-history-table tbody");
    // Clear existing rows
    historyTableBody.innerHTML = "";
    if (history.length === 0) {
        const noDataRow = document.createElement("tr");
        const noDataCell = document.createElement("td");
        noDataCell.colSpan = 8;
        noDataCell.textContent = "No dispatch history available.";
        noDataRow.appendChild(noDataCell);
        historyTableBody.appendChild(noDataRow);
        return;
    }
    // Populate table rows
    history.forEach((entry) => {
        const row = document.createElement("tr");
        // Owner cell
        const ownerCell = document.createElement("td");
        ownerCell.textContent = entry.owner;
        // Repo cell
        const repoCell = document.createElement("td");
        repoCell.textContent = entry.repo;
        // Workflow cell
        const workflowCell = document.createElement("td");
        workflowCell.textContent = entry.workflow;
        // Ref cell
        const refCell = document.createElement("td");
        refCell.textContent = entry.ref;
        // Status cell
        const statusCell = document.createElement("td");
        statusCell.textContent = entry.status;
        statusCell.style.color = entry.status === "success" ? "green" : "red";
        // Payload cell with styled JSON
        const payloadCell = document.createElement("td");
        if (entry.payload && Object.keys(entry.payload).length > 0) {
            const jsonContainer = document.createElement("div");
            jsonContainer.className = "json-container";
            const formattedPayload = Object.entries(entry.payload)
                .map(([key, value]) => `<span class="key">"${key}"</span>: <span class="value">"${value}"</span>`)
                .join(",<br>");
            jsonContainer.innerHTML = `{<br>${formattedPayload}<br>}`;
            payloadCell.appendChild(jsonContainer);
        }
        else {
            payloadCell.textContent = "{}";
        }
        // Error message cell
        const errorCell = document.createElement("td");
        errorCell.textContent = entry.errorMessage || "N/A";
        // Timestamp cell
        const timestampCell = document.createElement("td");
        timestampCell.textContent = new Date(entry.timestamp).toLocaleString();
        // Append all cells to the row
        row.appendChild(ownerCell);
        row.appendChild(repoCell);
        row.appendChild(workflowCell);
        row.appendChild(refCell);
        row.appendChild(statusCell);
        row.appendChild(payloadCell);
        row.appendChild(errorCell);
        row.appendChild(timestampCell);
        // Append the row to the table body
        historyTableBody.appendChild(row);
    });
}
