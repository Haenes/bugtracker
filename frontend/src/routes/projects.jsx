import { replace } from "react-router";

import i18n from "../i18n/config.js";
import { createItem, updateItem, deleteItem, getItems } from "../client/base.js";

import { PageContent } from "../components/PageContent.jsx";
import { ProjectsList } from "../components/Projects/ProjectsList.jsx";
import { authProvider } from "./auth/authProvider.jsx";


export function Component() {
    return (
        <PageContent header={i18n.t("projectsList_header")}>
            <ProjectsList />
        </PageContent>
    );
}


export async function loader({ request }) {
    if (!authProvider.jwtLifetime) return replace("/login");

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


export async function action({ request }) {
    const formData = await request.formData();
    const intent = formData.get("intent");

    switch (intent) {
        case "create": {
            return await createProjectAction(formData);
        }
        case "edit": {
            return await editProjectAction(formData.get("projectId"), formData);
        }
        case "delete": {
            return await deleteProjectAction(formData.get("projectId"));
        }
    }
}


async function createProjectAction(formData) {
    const errors = selectValidation(formData);
    if (Object.keys(errors).length) return errors;

    const project = await createItem(Object.fromEntries(formData));

    return project.detail ? afterSubmitValidation(project, "create") : project;
}


async function editProjectAction(projectId, formData) {
    // Handles the case, when you want to unfavorite project,
    // but because the unchecked checkbox is null (not false!)
    // the project remains a favorite.
    formData.get("starred") === null && formData.set("starred", false);

    const project = await updateItem(
        Object.fromEntries(formData),
        projectId
    );

    return project.detail ?
        afterSubmitValidation(project, "edit", projectId) :
        project;
}


async function deleteProjectAction(projectId) {
    const results = await deleteItem(projectId);
    return results.results === "Success" && replace("");
}


/**
 * Function to validate select's from form
 * before send fetch request.
 * @param {*} formData 
 * @returns {object}
 */
function selectValidation(formData) {
    const errors = {};
    const type = formData.get("type");

    if (!type) {
        errors.createType = i18n.t("error_projectType");
    }
    return errors;
}


/**
 * Function to validate Name and Key fields
 * from form after send fetch request.
 * @param {*} formData 
 * @returns {object}
 */
function afterSubmitValidation(project, intent) {
    const errors = {};

    if (project.detail === "Project with this key already exist!") {
        intent === "create" ?
        errors.createKey = i18n.t("error_projectKey") :
        errors.editKey = i18n.t("error_projectKey");

        return errors;
    } else if (project.detail === "Project with this name already exist!") {
        intent === "create" ?
        errors.createName = i18n.t("error_projectName") :
        errors.editName = i18n.t("error_projectKey");

        return errors;
    }
}
