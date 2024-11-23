import { redirect } from "react-router";

import { userLogin } from "../../client/auth.js";
import { LoginForm } from "../../components/Auth/LoginForm.jsx";


export function Login() {
    return <LoginForm />;
}


export async function loginAction({ request }) {
    const formData = await request.formData();
    const results = await userLogin(formData);
    const errors = {};

    if (results.ok) {
        return redirect("/projects");
    } else {
        errors.auth = "Invalid email and/or password!"
        return errors;
    }
}
