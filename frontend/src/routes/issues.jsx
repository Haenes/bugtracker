import { getItems } from "../client/base.js";
import { IssuesBoard } from "../components/IssuesBoard.jsx";

import { Page } from "../components/Page.jsx";


export function Issues() {
    const header = "Issues";

    return (
        <Page header={header} modalTitle={header.slice(0, -1)}>
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
        limit = 10;
    }

    const issues = await getItems(page, limit, params.projectId);

    if (issues.results == "You don't have any issues for this project!") {
        return false;
    } else {
        return issues;
    }
}
