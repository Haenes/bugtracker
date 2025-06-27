import { replace } from "react-router";

import i18n from "../i18n/config.js";
import { getMyId } from "../client/auth.js";
import { getItems, updateItem, deleteItem, createItem } from "../client/base.js";

import { TasksBoard } from "../components/Tasks/TasksBoard.jsx";
import { PageContent } from "../components/PageContent.jsx";
import { authProvider } from "./auth/authProvider.jsx";


export function Component() {
    return (
        <PageContent>
            <TasksBoard />
        </PageContent>
    );
}


export async function loader({ request, params }) {

    if (!authProvider.jwtLifetime) {
        return replace(`/login?next=${new URL(request.url).pathname}`);
    }

    const urlParams = new URL(request.url)?.searchParams;
    const projectId = params.projectId.split("=").at(-1);
    let page;
    let limit;

    if (urlParams.has("page")) {
        page = urlParams.get("page");
        limit = urlParams.get("limit");
    } else {
        page = 1;
        limit = 100;
    }

    const tasks = await getItems(page, limit, projectId);
    const userId = await getMyId();

    if (tasks.detail === "Project not found!") {
        throw({status: 404, statusText: i18n.t("tasksBoard_projectNotFound")});
    }
    return {tasks, userId};
}


export async function action({ request, params }) {
    const formData = await request.formData();

    const projectId = params.projectId.split("=").at(-1);
    const taskId = formData.get("taskId")
    const intent = formData.get("intent");

    switch (intent) {
        case "create": {
            return await createTaskAction(projectId, formData);
        }
        case "edit": {
            return await editTaskAction(projectId, taskId, formData);
        }
        case "delete": {
            return await deleteTaskAction(projectId, taskId);
        }
    }
}


async function createTaskAction(projectId, formData) {
    const errors = selectValidation(formData);
    if (Object.keys(errors).length) return errors;

    const task = await createItem(Object.fromEntries(formData), projectId);

    if (task.detail == "Task with this name already exist!") {
        errors.createName = i18n.t("error_taskName");
        return errors;
    }
    return task;
}


async function editTaskAction(projectId, taskId, formData) {
    const errors = {};
    let issueData = Object.fromEntries(formData);
    // Prevents incorrect date input error on backend.
    issueData.deadline_at === "" && delete issueData.deadline_at;

    const task = await updateItem(
        issueData,
        projectId,
        taskId
    );

    if (task.detail) {
        errors.editName = i18n.t("error_taskName");
        return errors;
    }
    return task;
}


async function deleteTaskAction(projectId, taskId) {
    const results = await deleteItem(projectId, taskId);
    return results.results === "Success" && replace("");
}


/**
 * Function to validate select's from form
 * before send create fetch POST request.
 * @param {*} formData 
 * @returns {object}
 */
function selectValidation(formData) {
    const errors = {};

    const type = formData.get("type_id");
    const priority = formData.get("priority_id");

    if (!type) {
        errors.createType = i18n.t("error_taskType");
    }
    if (!priority) {
        errors.createPriority = i18n.t("error_taskPriority");
    }
    return errors;
}
