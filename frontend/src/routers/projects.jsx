import { getItems } from "../client/base.js";
import { Page } from "../components/Page.jsx";
import { ProjectsList } from "../components/ProjectsList.jsx";


export function Projects() {
    return <Page header={"Projects"}> <ProjectsList /> </Page>
}


export async function projectsLoader() {
    const projects = await getItems();

    if (projects.results == "You don't have any project!") {
        return false;
    } else {
        return projects;
    }

}
