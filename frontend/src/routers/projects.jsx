import { createItem, getItems } from "../client/base.js";
import { Page } from "../components/Page.jsx";
import { ProjectsList } from "../components/ProjectsList.jsx";


export function Projects() {
    return <Page header={"Projects"}> <ProjectsList /> </Page>
}


export async function projectsLoader( {request} ) {
    const params = new URL(request.url)?.searchParams;
    let page;
    let limit;

    if (params.has("page")) {
        page = params.get("page");
        limit = params.get("limit");
    } else {
        page = 1;
        limit = 10;
    }

    const projects = await getItems(page, limit);

    if (projects.results == "You don't have any project!") {
        return false;
    } else {
        return projects;
    }
}


export async function projectsAction({ request }) {
    const formData = await request.formData();

    const project = await createItem(Object.fromEntries(formData));
    const errors = {};

    console.log("project", project)
    return project
}