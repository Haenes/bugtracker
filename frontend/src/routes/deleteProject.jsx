import { redirect } from "react-router-dom";
import { deleteItem } from "../client/base";


export async function deleteProjectAction({ params }) {
    const project_id = params.projectId;
    const results = await deleteItem(project_id);

    return results.results === "Success" && redirect("/projects");
}
