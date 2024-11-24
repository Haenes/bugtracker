import { replace  } from "react-router";
import { userLogout } from "../../client/auth.js";


export async function logoutAction() {
    const result = await userLogout();
    return result.ok && replace("/login");
}
