import { redirect } from "react-router-dom";
import { updateItem } from "../../client/base.js";


export async function editProjectAction({ request, params }) {
    const formData = await request.formData();

    // Handles the case, when you want to unfavorite project,
    // but because the unchecked checkbox is null (not false!)
    // the project remains a favorite.
    formData.get("starred") === null && formData.set("starred", false);

    const results = await updateItem(
        Object.fromEntries(formData),
        params.projectId
    );
    console.log(results);
    
    return results.updated && redirect("/projects");
}
