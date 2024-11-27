import { replace } from "react-router";

import { userForgotPassword } from "../../client/auth.js";
import { ForgotPasswordForm } from "../../components/Auth/ForgotPasswordForm.jsx";


export function ForgotPassword() {
    return <ForgotPasswordForm />
}


export async function forgotPasswordAction({ request }) {
    const formData = await request.formData();

    const result = await userForgotPassword(
        Object.fromEntries(formData)
    );

    if (!result.ok) {
        throw({status: 422, statusText: "Validation Error."});
    }

    return replace("/login?forgotPassword=true");
}
