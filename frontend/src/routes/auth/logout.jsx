import { replace  } from "react-router";
import { userLogout } from "../../client/auth.js";
import { authProvider } from "./authProvider.jsx";


export async function action() {
    if (!authProvider.jwtLifetime) return replace("/login");

    const result = await userLogout();
    authProvider.signOut();

    return result.ok && replace("/login");
}
 