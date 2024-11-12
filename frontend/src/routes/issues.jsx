import { getItems, createItem } from "../client/base.js";

import { IssuesBoard } from "../components/IssuesBoard.jsx";
import { CreateIssueForm } from "../components/CreateIssueForm.jsx";
import { Page } from "../components/Page.jsx";


export function Issues() {
    const header = "Issues";

    return (
        <Page
            header={header}
            modalTitle={header.slice(0, -1)}
            modalForm={<CreateIssueForm />}
        >
            <IssuesBoard />
        </Page>
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
    const project_id = params.projectId;
    const formData = await request.formData();
    const errors = selectValidation(formData);
    
    if (Object.keys(errors).length) return errors;

    formData.append("project_id", project_id);
    const issue = await createItem(Object.fromEntries(formData), project_id);

    if (issue.detail == "Issue with this title already exist!") {
        errors.errorTitle = "Issue with this title already exist!";
        return errors;
    }
    return issue;
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
    const priority = formData.get("priority");

    if (!type) {
        errors.errorType = "Please, select the issue type!";
    }
    if (!priority) {
        errors.errorPriority = "Please, select the priority of the issue!";
    }
    return errors;
}
