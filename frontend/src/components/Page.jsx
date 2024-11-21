import { Layout } from "antd"

import { Sidebar } from "./Sidebar.jsx"
import { PageContent } from "./PageContent.jsx"
import { ModalProvider } from "./ModalProvider.jsx"


export function Page({ header, children }) {
    return (
        <Layout hasSider>
            <Sidebar />

            <ModalProvider>
                <PageContent header={header}>
                    {children}
                </PageContent>
            </ModalProvider>

        </Layout>
    );
}


export function convertDate(date) {
    const dateObj = new Date(Date.parse(date));
    const dateFormat = new Intl.DateTimeFormat(
        ["ru-RU", "en-US"],
        {dateStyle: "short", timeStyle: "medium"}
    )

    return dateFormat.format(dateObj);
}
