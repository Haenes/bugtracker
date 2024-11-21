import { createItem, getItems } from "../../client/base.js";
import { Page } from "../../components/Page.jsx";
import { ProjectsList } from "../../components/Projects/ProjectsList.jsx";


export function Projects() {
    return (
        <Page header="Projects">
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
    const formData = await request.formData();
    const errors = selectValidation(formData);

    if (Object.keys(errors).length) return errors;

    const project = await createItem(Object.fromEntries(formData));

    if (project.detail == "Project with this key already exist!") {
        errors.errorKey = "Project with this key already exist!";
        return errors;
    } else if (project.detail == "Project with this name already exist!") {
        errors.errorName = "Project with this name already exist!";
        return errors;
    }

    return project;
}


/**
 * Function to validate select's from form
 * before send fetch request.
 * @param {*} formData 
 * @returns {Array}
 */
function selectValidation(formData) {
    const errors = {};
    const type = formData.get("type");

    if (!type) {
        errors.errorType = "Please, select the project type!";
    }
    return errors;
}
