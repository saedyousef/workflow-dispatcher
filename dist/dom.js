/**
 * Created by yousef on 12/27/2024 at 4:30 PM
 * Description: dom.ts
 */
/**
 * DOM Manipulation Functions
 */
function getOrdinalSuffix(day) {
    if (day > 3 && day < 21)
        return 'th';
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}
export function formatTimestamp(iso) {
    const date = new Date(iso);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    const time = date.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
    return `${day}${getOrdinalSuffix(day)} ${month} ${year} ${time}`;
}
export function showDispatchDetails(entry) {
    const container = document.getElementById("dispatch-details-content");
    if (!container)
        return;
    container.innerHTML = `
        <p><strong>Repository:</strong> ${entry.owner}/${entry.repo}</p>
        <p><strong>Workflow:</strong> ${entry.workflow}</p>
        <p><strong>Branch:</strong> ${entry.ref}</p>
        <p><strong>Status:</strong> ${entry.status}</p>
        <p><strong>Timestamp:</strong> ${formatTimestamp(entry.timestamp)}</p>
        ${entry.errorMessage ? `<p><strong>Error:</strong> ${entry.errorMessage}</p>` : ""}
    `;
    if (entry.payload && Object.keys(entry.payload).length > 0) {
        const table = document.createElement("table");
        table.className = "payload-table";
        table.innerHTML = "<tr><th>Key</th><th>Value</th></tr>";
        Object.entries(entry.payload).forEach(([key, value]) => {
            const row = document.createElement("tr");
            const k = document.createElement("td");
            k.textContent = key;
            const v = document.createElement("td");
            v.textContent = typeof value === 'object' ? JSON.stringify(value) : String(value);
            row.appendChild(k);
            row.appendChild(v);
            table.appendChild(row);
        });
        container.appendChild(table);
    }
    if (typeof MicroModal !== "undefined") {
        MicroModal.show("dispatch-details-modal");
    }
}
export function displayDispatchHistory(history) {
    const historyTableBody = document.querySelector("#dispatch-history-table tbody");
    // Clear existing rows
    historyTableBody.innerHTML = "";
    if (history.length === 0) {
        const noDataRow = document.createElement("tr");
        const noDataCell = document.createElement("td");
        noDataCell.colSpan = 6;
        noDataCell.textContent = "No dispatch history available.";
        noDataRow.appendChild(noDataCell);
        historyTableBody.appendChild(noDataRow);
        return;
    }
    // Sort by timestamp descending
    const sorted = [...history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    // Populate table rows
    sorted.forEach((entry) => {
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
        // Status cell
        const statusCell = document.createElement("td");
        statusCell.textContent = entry.status;
        statusCell.style.color = entry.status === "success" ? "green" : "red";
        // Timestamp cell
        const timestampCell = document.createElement("td");
        timestampCell.textContent = formatTimestamp(entry.timestamp);
        const detailsCell = document.createElement("td");
        const detailsButton = document.createElement("button");
        detailsButton.textContent = "View Details";
        detailsButton.className = "btn-action";
        detailsButton.addEventListener("click", () => showDispatchDetails(entry));
        detailsCell.appendChild(detailsButton);
        // Append all cells to the row
        row.appendChild(ownerCell);
        row.appendChild(repoCell);
        row.appendChild(workflowCell);
        row.appendChild(statusCell);
        row.appendChild(timestampCell);
        row.appendChild(detailsCell);
        // Append the row to the table body
        historyTableBody.appendChild(row);
    });
}
