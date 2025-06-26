/**
 * Created by yousef on 12/27/2024 at 4:30 PM
 * Description: workflow.ts
 */
/**
 * Workflow Management
 */

import { WorkflowPayload, DispatchHistory, DispatchHistoryEntry} from './types.js';

export async function dispatchWorkflow(
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

    const body = JSON.stringify({ ref, inputs: payload });

    return fetch(url, { method: "POST", headers, body });
}

export function saveDispatchHistory(dispatch: DispatchHistoryEntry): void {
    const history: DispatchHistory = JSON.parse(localStorage.getItem("dispatch_history") || "[]");
    history.push(dispatch);
    localStorage.setItem("dispatch_history", JSON.stringify(history));
}

export function clearDispatchHistory(): void {
    localStorage.removeItem("dispatch_history");
}
