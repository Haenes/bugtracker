import { replace } from "react-router";

import i18n from "../../i18n/config.js";
import { userVerification } from "../../client/auth.js";


export async function loader({ params }) {
    const result = await userVerification(params.token);

    if (result.detail === "VERIFY_USER_ALREADY_VERIFIED") {
        throw({status: 400, statusText: i18n.t("error_verifyAlready")})
    } else if (result.detail === "VERIFY_USER_BAD_TOKEN") {
        throw({status: 400, statusText: i18n.t("error_verifyInvalidToken")})
    }

    return replace("/login?verify=true");
}
