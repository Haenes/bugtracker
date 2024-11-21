import { redirect } from "react-router-dom";
import { updateItem } from "../../client/base.js";


export async function editIssueAction({ request, params }) {
    const formData = await request.formData();
    const results = await updateItem(
        Object.fromEntries(formData),
        params.projectId,
        params.issueId
    );
    console.log(results);
    
    return results.updated && redirect(`/projects/${params.projectId}/issues`);
}
