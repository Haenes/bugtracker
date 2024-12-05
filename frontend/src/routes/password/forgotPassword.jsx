import { replace } from "react-router";

import i18n from "../../i18n/config.js";
import { userForgotPassword } from "../../client/auth.js";
import { ForgotPasswordForm } from "../../components/Auth/ForgotPasswordForm.jsx";


export function Component() {
    return <ForgotPasswordForm />
}


export async function action({ request }) {
    const formData = await request.formData();

    const result = await userForgotPassword(
        Object.fromEntries(formData),
        i18n.resolvedLanguage
    );

    if (!result.ok) {
        throw({status: 422, statusText: i18n.t("error_forgotPassword")});
    }

    return replace("/login?forgotPassword=true");
}
