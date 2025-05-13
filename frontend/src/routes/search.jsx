import { useTranslation } from "react-i18next";

import { getItem, searchItems } from "../client/base.js";
import { PageContent } from "../components/PageContent.jsx";
import { SearchForm } from "../components/SearchForm.jsx";


export function Component() {
    const { t } = useTranslation();

    return (
        <PageContent header={t("search_header")}>
            <div className="md:w-1/2">
                <SearchForm />
            </div>
        </PageContent>
    );
}


export async function loader({ request }) {   
    const searchQuery = new URL(request.url)?.searchParams.get("q");

    if (searchQuery) {
        const searchResults = await searchItems(searchQuery);
        await addProjectNameToTaskResults(searchResults);
        return {searchQuery, searchResults};
    }
}


export async function action({ request }) {
    const formData = await request.formData();
    const searchResults = await searchItems(formData.get("q"));
    return await addProjectNameToTaskResults(searchResults);
}


async function addProjectNameToTaskResults(searchResults) {
    // Help to decrease requests to API, if project name is already known.
    let knownProjectNames = new Map();

    if (searchResults?.tasks) {
        for (let task of searchResults?.tasks) {

            if (knownProjectNames.get(task.project_id)) {
                task["project_name"] = knownProjectNames.get(task.project_id);
                continue;
            }

            const project = await getItem(task.project_id);
            knownProjectNames.set(project.id, project.name);
            task["project_name"] = project.name;
        }
    }
    return searchResults;
}
