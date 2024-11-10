import { redirect } from "react-router-dom";

import { userRegistration } from "../client/auth";
import { RegisterForm } from "../components/RegisterForm";


export function Registration() {
    return <RegisterForm />;
}


export async function registerAction({ request }) {
    const formData = await request.formData();
    const errors = formValidation(formData);

    if (Object.keys(errors).length) {
        return errors;
    } else {
        const results = await userRegistration(Object.fromEntries(formData));
    
        if (results["detail"] == "REGISTER_USER_ALREADY_EXISTS") {
            // errors.email = "A user with this email already exists."
            errors.email = "This email already taken";
        } else if (results["detail"] == "USERNAME_ALREADY_EXISTS") {
            // errors.username = "A user with this username already exists."
            errors.username = "This username already taken";
        }
        
        return Object.keys(errors).length ? errors : redirect("/login");
    }
}


/**
 * Function to validate data from form
 * before send fetch request
 * @param {*} formData 
 * @returns {Array}
 */
function formValidation(formData) {
    const errors = {};

    const first_name = formData.get("first_name");
    const last_name = formData.get("last_name");
    const password = formData.get("password");
    const confirm_password = formData.get("confirm_password");

    if (!validateName(first_name) && !validateName(last_name)) {
        errors.first_name = "Only letters are allowed";
    } else if (!validateName(first_name)) {
        errors.first_name = "Only letters are allowed";
    } else if (!validateName(last_name)) {
        errors.last_name = "Only letters are allowed";
    }

    if (!validatePassword(password)) {
        errors.password = "Password doesn't meet the conditions";
    } else if (password != confirm_password) {
        errors.confirm_password = "Password confirmation is wrong";
    }

    return errors;
}


/**
 * Checks that the name consists only of letters
 * @param {String} value 
 * @returns {boolean}
 */
function validateName(name) {
    if (/^[a-zA-Z]+$/.test(name)) {
        return true;
    }
    return false;
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
