import { replace } from "react-router";

import i18n from "../i18n/config.js";
import { getItems, updateItem, deleteItem, createItem } from "../client/base.js";

import { IssuesBoard } from "../components/Issues/IssuesBoard.jsx";
import { PageContent } from "../components/PageContent.jsx";
import { authProvider } from "./auth/authProvider.jsx";


export function Component() {
    return (
        <PageContent header="Issues">
            <IssuesBoard />
        </PageContent>
    );
}


export async function loader({ request, params }) {
    if (!authProvider.jwtLifetime) {
        return replace(`/login?next=${new URL(request.url).pathname}`);
    }

    const urlParams = new URL(request.url)?.searchParams;
    let page;
    let limit;

    if (urlParams.has("page")) {
        page = urlParams.get("page");
        limit = urlParams.get("limit");
    } else {
        page = 1;
        limit = 100;
    }

    const issues = await getItems(page, limit, params.projectId);

    if (issues.results == "You don't have any issues for this project!") {
        return false;
    } else {
        return issues;
    }
}


export async function action({ request, params }) {
    const formData = await request.formData();

    const projectId = params.projectId;
    const issueId = formData.get("issueId")
    const intent = formData.get("intent");

    switch (intent) {
        case "create": {
            return await createIssueAction(projectId, formData);
        }
        case "edit": {
            return await editIssueAction(projectId, issueId, formData);
        }
        case "delete": {
            return await deleteIssueAction(projectId, issueId);
        }
    }
}


async function createIssueAction(projectId, formData) {
    const errors = selectValidation(formData);
    if (Object.keys(errors).length) return errors;

    const issue = await createItem(Object.fromEntries(formData), projectId);

    if (issue.detail == "Issue with this title already exist!") {
        errors.createTitle = i18n.t("error_issueTitle");
        return errors;
    }
    return issue;
}


async function editIssueAction(projectId, issueId, formData) {
    const errors = {};

    const issue = await updateItem(
        Object.fromEntries(formData),
        projectId,
        issueId
    );

    if (issue.detail) {
        errors.editTitle = i18n.t("error_issueTitle");
        return errors;
    }
    return issue;
}


async function deleteIssueAction(projectId, issueId) {
    const results = await deleteItem(projectId, issueId);
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

    const type = formData.get("type");
    const priority = formData.get("priority");

    if (!type) {
        errors.createType = i18n.t("error_issueType");
    }
    if (!priority) {
        errors.createPriority = i18n.t("error_issuePriority");
    }
    return errors;
}
