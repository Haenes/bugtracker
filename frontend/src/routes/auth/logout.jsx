import { replace  } from "react-router";
import { userLogout } from "../../client/auth.js";
import { authProvider } from "./authProvider.jsx";


export async function logoutAction() {
    const result = await userLogout();
    authProvider.setFalse();

    return result.ok && replace("/login");
}
 