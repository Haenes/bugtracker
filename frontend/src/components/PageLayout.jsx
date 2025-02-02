import { useEffect, useState } from "react";

import { Outlet, useSubmit, useNavigation } from "react-router";

import { Spin } from "antd";

import { Sidebar } from "./Sidebar.jsx";
import { authProvider } from "../routes/auth/authProvider.jsx";


export function Component() {
    useJwtExpirationTime();

    const navigation = useNavigation();
    const [modalOpen, setModalOpen] = useState({visible: false, modalId: 0});

    return (
        <>
            {navigation.state === "loading" && !modalOpen.visible
                && <Spin fullscreen delay={50}/>
            }
            <Sidebar setModalOpen={setModalOpen} />
            <Outlet context={[modalOpen, setModalOpen]}/>
        </>
    );
}


export function convertDate(date) {
    const dateObj = new Date(date);
    const locale = localStorage.getItem("i18nextLng");

    const dateFormat = new Intl.DateTimeFormat(
        locale,
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
            submit(null, {method: "POST", action: "/logout?sessionExpired=true"});

        // Dynamic set of delay help to fight
        // with timer reset on page reload.
        }, authProvider.jwtLifetime - Date.now())

        return () => clearTimeout(timer);

    }, [authProvider.jwtLifetime]);
}
