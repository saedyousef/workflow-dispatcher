/**
 * Created by yousef on 12/23/2024 at 2:51 PM
 * Description: types.d
 */


export enum Status {
    Success = 'success',
    Failure = 'failure'
}
export type WorkflowPayload = Record<string, string>;
export type DispatchHistoryEntry = {
    owner: string;
    repo: string;
    workflow: string;
    ref: string;
    payload: WorkflowPayload;
    timestamp: string;
    status: Status;
    errorMessage: string | null;
};
export type DispatchHistory = DispatchHistoryEntry[];