import { Sidebar } from "./Sidebar.jsx"
import { PageContent } from "./PageContent.jsx"
import { ProjectsTable } from "./ProjectsTable.jsx"

export function Page() {
    return (
        <Sidebar>
            <PageContent>
                <ProjectsTable />
            </PageContent>
        </Sidebar>
    )
}
