import { Sidebar } from "./Sidebar.jsx"
import { PageContent } from "./PageContent.jsx"

export function Page() {
    return (
        <Sidebar>
            <PageContent />
        </Sidebar>
    )
}
