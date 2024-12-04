import { replace, useLocation, useNavigate } from "react-router";

import { useTranslation } from "react-i18next";

import { Alert } from "antd";

import { userLogin } from "../../client/auth.js";
import { LoginForm } from "../../components/Auth/LoginForm.jsx";
import { authProvider } from "./authProvider.jsx";


export function Component() {
    const { t } = useTranslation();
    const location = useLocation().search;
    return (
        <LoginForm>
            {location.includes("register") &&
                <GetAlert description={t("alert_register")} />
            }
            {location.includes("verify") &&
                <GetAlert message={t("alert_verify")} type="success" />
            }
            {location.includes("forgotPassword") &&
                <GetAlert description={t("alert_forgotPassword")} />
            }
            {location.includes("resetPassword") &&
                <GetAlert message={t("alert_resetPassword")} type="success" />
            }
        </LoginForm>
    );
}


export async function loader() {
    if (authProvider.jwtLifetime) {
        return replace("/projects");
    }
    return null;
}


export async function action({ request }) {
    const formData = await request.formData();
    const results = await userLogin(formData);

    const next = new URL(request.url)?.searchParams.get("next");
    const errors = {};

    if (results.detail === "LOGIN_BAD_CREDENTIALS") {
        errors.auth = "Invalid email and/or password!"
        return errors;
    } else if (results.detail === "LOGIN_USER_NOT_VERIFIED") {
        errors.verify = "You are not verified! Check email."
        return errors;
    }

    authProvider.signIn();
    return replace(next ? next : "/projects");
}


/**
 * Shortens the code when you
 * need several similar alerts.
 * @param {string} message
 * @param {string} type
 * @param {string} description 
 * @returns
 */
function GetAlert({
    message,
    type = "info",
    description
}) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const handleClose = () => navigate("/login", {replace: true});

    return (
        <Alert
            message={message ?  message : t("alert_defaultMessage")}
            type={type}
            description={description || null}
            showIcon
            closable
            onClose={handleClose}
        />
    );
}
