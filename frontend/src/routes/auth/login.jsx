import { replace, useLocation } from "react-router";

import {Alert} from "antd";

import { userLogin } from "../../client/auth.js";
import { LoginForm } from "../../components/Auth/LoginForm.jsx";


export function Login() {
    const location = useLocation().search;

    if (location.includes("register")) {
        return (
            <LoginForm>
                <Alert
                    message="Almost done!"
                    description="Check your email to confirm it!"
                    type="info"
                    showIcon
                    closable
                />
            </LoginForm>
        )
    } else if (location.includes("verify")) {
        return (
            <LoginForm>
                <Alert
                    message="Mail is confirmed!"
                    type="success"
                    showIcon
                    closable
                />
            </LoginForm>
        )
    } else if (location.includes("forgotPassword")) {
        return (
            <LoginForm>
                <Alert
                    message="Almost done!"
                    description="Check your email to recover password!"
                    type="info"
                    showIcon
                    closable
                />
            </LoginForm>
        )
    } else if (location.includes("resetPassword")) {
        return (
            <LoginForm>
                <Alert
                    message="Access restored!"
                    type="success"
                    showIcon
                    closable
                />
            </LoginForm>
        )
    }
    return <LoginForm />
}


export async function loginAction({ request }) {
    const formData = await request.formData();
    const results = await userLogin(formData);
    const errors = {};

    if (results.detail === "LOGIN_BAD_CREDENTIALS") {
        errors.auth = "Invalid email and/or password!"
        return errors;
    } else if (results.detail === "LOGIN_USER_NOT_VERIFIED") {
        errors.verify = "You are not verified! Check email."
        return errors;
    }

    return replace("/projects");
}
