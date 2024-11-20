import { redirect } from "react-router-dom";
import { deleteItem } from "../client/base";


export async function deleteProjectAction({ params }) {
    const results = await deleteItem(params.projectId);
    return results.results === "Success" && redirect("/projects");
}
