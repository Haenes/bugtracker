import { replace } from "react-router";

import { getItems, updateItem, deleteItem, createItem } from "../client/base.js";

import { IssuesBoard } from "../components/Issues/IssuesBoard.jsx";
import { PageContent } from "../components/PageContent.jsx";


export function Issues() {
    return (
        <PageContent header="Issues">
            <IssuesBoard />
        </PageContent>
    );
}


export async function issuesLoader({ request, params }) {
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


export async function issuesAction({ request, params }) {
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
        errors.createTitle = "Issue with this title already exist!";
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
        errors.editTitle = "Issue with this title already exists!";
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
        errors.createType = "Please, select the issue type!";
    }
    if (!priority) {
        errors.createPriority = "Please, select the priority of the issue!";
    }
    return errors;
}
