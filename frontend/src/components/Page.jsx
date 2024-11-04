import { Sidebar } from "./Sidebar.jsx"
import { PageContent } from "./PageContent.jsx"


export function Page({ header, children }) {
    return (
        <Sidebar>
            <PageContent header={header}>
                {children}
            </PageContent>
        </Sidebar>
    )
}
