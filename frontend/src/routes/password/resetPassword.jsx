import { replace } from "react-router";

import i18n from "../../i18n/config.js";
import { userResetPassword } from "../../client/auth.js";
import { passwordValidation } from "../utils.js";
import { ResetPasswordForm } from "../../components/Auth/ResetPasswordForm.jsx";


export function Component() {
    return <ResetPasswordForm />;
}


export async function action({ request, params }) {
    const formData = await request.formData();
    const errors = passwordValidation(formData);

    if (Object.keys(errors).length) return errors;

    const result = await userResetPassword( 
        formData.get("password"),
        params.token
    );

    if (!result.ok) {
        throw({status: 400, statusText: i18n.t("error_resetPassword")});
    }
    
    return replace("/login?resetPassword=true");
}
