import { redirect } from "react-router-dom";
import { deleteItem } from "../../client/base.js";


export async function deleteIssueAction({ params }) {
    const results = await deleteItem(params.projectId, params.issueId);

    return (
        results.results === "Success"
        &&
        redirect(`/projects/${params.projectId}/issues`)
    );
}
