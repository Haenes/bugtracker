import { replace } from "react-router";
import i18n from "../i18n/config.js";

import {
    createItem,
    updateItem,
    deleteItem,
    getItems,
    deleteUser,
    updateUserRole,
    createInvite,
    sendInvite,
    editInvite,
    deleteInvite,
} from "../client/base.js";
import { PageContent } from "../components/PageContent.jsx";
import { ProjectsList } from "../components/Projects/ProjectsList.jsx";
import { authProvider } from "./auth/authProvider.jsx";


export function Component() {
    return (
        <PageContent header={i18n.t("projectsHeader")}>
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
        limit = 20;
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
        case "inviteUser": {
            return await inviteUserAction(formData);
        }
        case "editUser": {
            return await editUserAction(formData);
        }
        case "deleteUser": {
            return await deleteUserAction(formData.get("projectId"), formData.get("userId"));
        }
        case "createInvite": {
            return await createInviteAction(formData);
        }
        case "editInvite": {
            return await editInviteAction(formData);
        }
        case "deleteInvite": {
            return await deleteInviteAction(formData.get("projectId"), formData.get("inviteId"));
        }
    }
}


async function createProjectAction(formData) {
    formData.set("key", formData.get("key").toUpperCase());

    const project = await createItem(Object.fromEntries(formData));

    return project.detail ? afterSubmitValidation(project, "create") : project;
}


async function editProjectAction(projectId, formData) {
    // Handles the case, when you want to unfavorite project,
    // but because the unchecked checkbox is null (not false!)
    // the project remains a favorite.
    formData.get("is_favorite") === null && formData.set("is_favorite", false);
    // Change project key to Uppercase, just bcs it looks better.
    formData.get("key") && formData.set("key", formData.get("key").toUpperCase());

    const project = await updateItem(
        Object.fromEntries(formData),
        projectId
    );

    return project.detail
        ? afterSubmitValidation(project, "edit", projectId)
        : project;
}


async function deleteProjectAction(projectId) {
    const results = await deleteItem(projectId);
    return results.results === "Success" && replace("");
}


async function inviteUserAction(formData) {
    const invited = await sendInvite(
        {
            user: {
                id: formData.get("userId"),
                first_name: formData.get("firstName")
            },
            invite_token: formData.get("inviteToken"),
        },
        formData.get("projectId")
    );
    return invited.status === "Success" && replace("");
}


async function editUserAction(formData) {
    const user = await updateUserRole(
        {"role_id": formData.get("roleId")},
        formData.get("projectId"),
        formData.get("userId")
    );
    return user.status === "Success" && replace("");
}


async function deleteUserAction(projectId, userId) {
    const results = await deleteUser(projectId, userId);
    return results.status === "Success" && replace("");
}


async function createInviteAction(formData) {
    let inviteData = Object.fromEntries(formData);
    inviteData?.max_uses == false && delete inviteData.max_uses;
    inviteData?.expires_at == false && delete inviteData.expires_at;

    const invite = await createInvite(inviteData.projectId, inviteData);
    return invite?.id && replace("");
}


async function editInviteAction(formData) {
    let updateData = JSON.parse(formData.get("updateData"));
    updateData?.role_id == false && delete updateData.role_id;
    updateData?.max_uses == false && delete updateData.max_uses;
    updateData?.expires_at == false && delete updateData.expires_at;

    const invite = await editInvite(
        formData.get("projectId"),
        formData.get("inviteId"),
        updateData,
    );
    return invite?.id && replace("");
}


async function deleteInviteAction(projectId, inviteId) {
    const results = await deleteInvite(projectId, inviteId);
    return results?.status === "Success" && replace("");
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
        intent === "create"
        ? errors.createKey = i18n.t("errorProjectKeyAlreadyExist")
        : errors.editKey = i18n.t("errorProjectKeyAlreadyExist");

        return errors;
    } else if (project.detail === "Slashes, ':', '?' and '=' not allowed in project name!") {
        intent === "create"
        ? errors.createName = i18n.t("errorProjectNameNotAllowed")
        : errors.editName = i18n.t("errorProjectNameNotAllowed");

        return errors;
    }
}
