import { replace } from "react-router";

import { userResetPassword } from "../../client/auth.js";
import { ResetPasswordForm } from "../../components/Auth/ResetPasswordForm.jsx";



export function ResetPassword() {
    return <ResetPasswordForm />
}



export async function resetPasswordAction({ request, params }) {
    const formData = await request.formData();
    const errors = formValidation(formData)

    if (Object.keys(errors).length) return errors;

    const result = await userResetPassword( 
        formData.get("password"),
        params.token
    );

    if (!result.ok) {
        throw({status: 400, statusText: "Bad token."})
    }
    
    return replace("/login?resetPassword=true");
}   


/**
 * Function to validate data from form
 * before send fetch request
 * @param {*} formData 
 * @returns {Array}
 */
function formValidation(formData) {
    const errors = {};

    const password = formData.get("password");
    const confirm_password = formData.get("confirm_password");

    if (!validatePassword(password)) {
        errors.password = "Password doesn't meet the conditions";
    } else if (password != confirm_password) {
        errors.confirm_password = "Password confirmation is wrong";
    }

    return errors;
}


/**
 * Checks that the password meets the conditions:
 * 1) a 8+ characters  {8,};
 * 2) at least one uppercase letter  (?=.*?[A-Z]);
 * 3) at least one lowercase letter  (?=.*?[a-z]);
 * 4) at least one digit  (?=.*?[0-9]);
 * 5) at least one special character  (?=.*?[#?!@$%^&*-])
 * @param {String} password 
 * @returns {boolean}
 */
function validatePassword(password) {
    const pattern =
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/

    if (pattern.test(password)) {
        return true;
    }
    return false;
}
