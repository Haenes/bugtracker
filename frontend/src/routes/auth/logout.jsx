import { replace  } from "react-router";
import { userLogout } from "../../client/auth.js";
import { authProvider } from "./authProvider.jsx";


export async function logoutAction() {
    if (!authProvider.isAuth) return replace("/login");

    const result = await userLogout();
    authProvider.setFalse();

    return result.ok && replace("/login");
}
 