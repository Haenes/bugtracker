import { Outlet } from "react-router"

import { Layout } from "antd"

import { Sidebar } from "./Sidebar.jsx"
import { ModalProvider } from "./ModalProvider.jsx"


export function PageLayout() {
    return (
        <Layout hasSider>
            <Sidebar />

            <ModalProvider>
                <Outlet />
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
