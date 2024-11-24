import { redirect } from "react-router";
import { userVerification } from "../../client/auth";


export async function verifyAction({ params }) {
    const result = await userVerification(params.token);

    if (result.detail === "VERIFY_USER_ALREADY_VERIFIED") {
        throw({status: 400, statusText: "Already verified."})
    } else if (result.detail === "VERIFY_USER_BAD_TOKEN") {
        throw({status: 400, statusText: "Token is invalid."})
    }

    return redirect("/login?verify=true");
}
