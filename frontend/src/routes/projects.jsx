import { createItem, getItems } from "../client/base.js";
import { Page } from "../components/Page.jsx";
import { ProjectsList } from "../components/ProjectsList.jsx";
import { ProjectForm } from "../components/ProjectForm.jsx"


export function Projects() {
    const header = "Projects";

    return (
        <Page header={header} modalTitle={header.slice(0, -1)} modalForm={<ProjectForm />}>
            <ProjectsList />
        </Page>
    );
}


export async function projectsLoader({ request }) {
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
    const errors = {};
    const formData = await request.formData();

    const project = await createItem(Object.fromEntries(formData));

    if (project.detail == "Project with this key already exist!") {
        errors.errorKey = "Project with this key already exist!";
    } else if (project.detail == "Project with this name already exist!") {
        errors.errorName = "Project with this name already exist!";
    }

    return Object.keys(errors).length ? errors : project;
}
