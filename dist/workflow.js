/**
 * Created by yousef on 12/27/2024 at 4:30 PM
 * Description: workflow.ts
 */
/**
 * Workflow Management
 */
export async function dispatchWorkflow(owner, repo, workflow, ref, pat, payload) {
    const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow}/dispatches`;
    const headers = {
        "Content-Type": "application/json",
        Authorization: `token ${pat}`,
        Accept: "application/vnd.github.v3+json",
    };
    const body = JSON.stringify({ ref, inputs: payload });
    return fetch(url, { method: "POST", headers, body });
}
export function saveDispatchHistory(dispatch) {
    const history = JSON.parse(localStorage.getItem("dispatch_history") || "[]");
    history.push(dispatch);
    localStorage.setItem("dispatch_history", JSON.stringify(history));
}
