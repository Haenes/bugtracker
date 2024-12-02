import { useEffect } from "react"

import { Outlet, useSubmit } from "react-router"

import { Layout } from "antd"

import { Sidebar } from "./Sidebar.jsx"
import { ModalProvider } from "./ModalProvider.jsx"
import { authProvider } from "../routes/auth/authProvider.jsx"


export function Component() {
    useJwtExpirationTime();

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


/**
 * Log out user after JWT expire in 3 hrs.
 */
function useJwtExpirationTime() {
    const submit = useSubmit();

    useEffect(() => {
        const timer = setTimeout(() => {
            submit(null, {method: "POST", action: "/logout"});

        // Dynamic set of delay help to fight
        // with timer reset on page reload.
        }, authProvider.jwtLifetime - new Date().getTime())

        return () => clearTimeout(timer);

    }, [authProvider.jwtLifetime]);
}
