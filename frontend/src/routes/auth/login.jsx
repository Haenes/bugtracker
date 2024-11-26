import { replace, useLocation, useNavigate } from "react-router";

import { Alert } from "antd";

import { userLogin } from "../../client/auth.js";
import { LoginForm } from "../../components/Auth/LoginForm.jsx";
import React from "react";


export function Login() {
    const location = useLocation().search;
    return (
        <LoginForm>
            {location.includes("register") &&
                <GetAlert description="Check your email to confirm it!" />
            }
            {location.includes("verify") &&
                <GetAlert message="Mail is confirmed!" type="success" />
            }
            {location.includes("forgotPassword") &&
                <GetAlert description="Check your email to recover password!" />
            }
            {location.includes("resetPassword") &&
                <GetAlert message="Access restored!" type="success" />
            }
        </LoginForm>
    );
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


/**
 * Shortens the code when you
 * need several similar alerts.
 * @param {string} message
 * @param {string} type
 * @param {string} description 
 * @returns {React.JSX.Element}
 */
function GetAlert({
    message = "Almost done!",
    type = "info",
    description
}) {
    const navigate = useNavigate();
    const handleClose = () => navigate("/login", {replace: true});

    return (
        <Alert
            message={message}
            type={type}
            description={description || null}
            showIcon
            closable
            onClose={handleClose}
        />
    );
}
