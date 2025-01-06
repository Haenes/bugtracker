import { replace } from "react-router";

import { authProvider } from "./auth/authProvider.jsx";
import { formValidation, passwordValidation } from "./utils.js";
import i18n from "../i18n/config.js";
import { getMe, editMe, deleteMe } from "../client/auth.js";

import { Settings } from "../components/Settings.jsx";


export function Component() {
    return <Settings />;
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

    if (result["detail"] === "UPDATE_USER_EMAIL_ALREADY_EXISTS") {
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
    errors.passwordChanged = true;

    return errors;
}


async function deleteUserAction() {
    const result = await deleteMe();
    authProvider.signOut();
    return result.ok && replace("/login");
}
