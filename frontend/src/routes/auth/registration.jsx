import { replace } from "react-router";

import { userRegistration } from "../../client/auth.js";
import { formValidation } from "./utils.js";
import { RegisterForm } from "../../components/Auth/RegisterForm.jsx";


export function Registration() {
    return <RegisterForm />;
}


export async function registerAction({ request }) {
    const formData = await request.formData();
    const errors = formValidation(formData);

    if (Object.keys(errors).length) return errors;

    const results = await userRegistration(Object.fromEntries(formData));

    if (results["detail"] === "REGISTER_USER_ALREADY_EXISTS") {
        errors.email = "This email already taken";
        return errors;
    } else if (results["detail"] === "USERNAME_ALREADY_EXISTS") {
        errors.username = "This username already taken";
        return errors;
    }
    
    return replace("/login?register=true");
}
