import { replace } from "react-router";
import { userVerification } from "../../client/auth.js";


export async function action({ params }) {
    const result = await userVerification(params.token);

    if (result.detail === "VERIFY_USER_ALREADY_VERIFIED") {
        throw({status: 400, statusText: "Already verified."})
    } else if (result.detail === "VERIFY_USER_BAD_TOKEN") {
        throw({status: 400, statusText: "Token is invalid."})
    }

    return replace("/login?verify=true");
}
