import { redirect } from "react-router-dom";

import { userLogin } from "../client/auth";
import { LoginForm } from "../components/LoginForm";


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
