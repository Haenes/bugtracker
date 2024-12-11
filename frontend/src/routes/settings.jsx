import { replace } from "react-router";

import { useTranslation } from "react-i18next";

import { Tabs } from "antd";

import { SunOutlined, MoonOutlined } from "@ant-design/icons";

import { authProvider } from "./auth/authProvider.jsx";
import { formValidation, passwordValidation } from "./utils.js";
import { getMe, editMe, deleteMe } from "../client/auth.js";
import { CreateModal } from "../components/ModalProvider.jsx";
import { ChangePasswordForm } from "../components/Auth/ChangePasswordForm.jsx";
import { PageContent } from "../components/PageContent.jsx";
import { AccountForm } from "../components/AccountForm.jsx";

 

export function Component() {
    const { t, i18n } = useTranslation();

    const handleClickMode = () => {
        const currentColorMode = localStorage.getItem("colorMode");
        
        localStorage.setItem(
            "colorMode",
            currentColorMode === "dark" ? "light" : "dark"
        );
        window.location.reload();
    };

    const handleClickLang = () => {
        let currentLang = localStorage.getItem("i18nextLng");
        i18n.changeLanguage(currentLang === "en" ? "ru" : "en");
    };

    const items = [
        {label: "Account", key: 1, children: <AccountForm />},
        {label: "Preferences", key: 2, children: <>
            <div className="flex flex-row items-center">
                <span className="mr-2">{t("settings_colorMode")}</span>
                {localStorage.getItem("colorMode") === "dark" ?
                <SunOutlined onClick={handleClickMode} /> : <MoonOutlined onClick={handleClickMode}/>}
            </div>

            <div className="flex flex-row items-center w-2/3">
                <span className="mr-2">{t("settings_lang")}</span>
            </div>
        </>}
    ]

    return (
        <PageContent header="Settings">
            <Tabs
                className="h-screen"
                tabPosition={"top"}
                items={items.map((_, i) => {return items[i]})}
            />

            <CreateModal modalId={3} title="Change password">
                <ChangePasswordForm />
            </CreateModal>
        </PageContent>
    );
}



export async function loader() {
    if (!authProvider.jwtLifetime) return replace("/login?next=/settings");
    return await getMe();
}


export async function action({ request }) {
    const formData = await request.formData();
    const intent = formData.get("intent");

    switch (intent) {
        case "edit": {
            return await editUserAction(formData);
        }
        case "changePassword": {
            return await changePasswordAction(formData);
        }
        case "delete": {
            return await deleteUserAction();
        }
    }
}


async function editUserAction(formData) {
    const errors = formValidation(formData, "editUser");

    if (Object.keys(errors).length) return errors;

    const result = await editMe(Object.fromEntries(formData));

    if (result["detail"] === "EMAIl_ALREADY_EXISTS") {
        errors.email = i18n.t("error_registerEmail");
        return errors;
    } else if (result["detail"] === "USERNAME_ALREADY_EXISTS") {
        errors.username = i18n.t("error_registerUsername");
        return errors;
    }

    return null;
}


async function changePasswordAction(formData) {
    const errors = passwordValidation(formData);

    if (Object.keys(errors).length) return errors;

    const result = await editMe(Object.fromEntries(formData));

    return "passwordChanged";
}


async function deleteUserAction() {
    const result = await deleteMe();
    authProvider.signOut();
    return result.ok && replace("/login");
}
