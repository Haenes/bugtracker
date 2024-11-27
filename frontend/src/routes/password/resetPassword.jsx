import { replace } from "react-router";

import { userResetPassword } from "../../client/auth.js";
import { formValidation } from "../utils.js";
import { ResetPasswordForm } from "../../components/Auth/ResetPasswordForm.jsx";


export function ResetPassword() {
    return <ResetPasswordForm />;
}


export async function resetPasswordAction({ request, params }) {
    const formData = await request.formData();
    const errors = formValidation(formData);

    if (Object.keys(errors).length) return errors;

    const result = await userResetPassword( 
        formData.get("password"),
        params.token
    );

    if (!result.ok) {
        throw({status: 400, statusText: "Bad token."});
    }
    
    return replace("/login?resetPassword=true");
}
