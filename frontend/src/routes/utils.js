import i18n from "../i18n/config.js";


/**
 * Function to validate data from
 * form before send fetch request.
 * @param {*} formData 
 * @returns {object}
 */
export function formValidation(formData, intent) {
    const errors = {};

    const first_name = formData.get("first_name");
    const password = formData.get("password");
    const confirm_password = formData.get("confirm_password");

    const nameError = i18n.t("error_nameNotLetters");

    if (!isValidName(first_name)) {
        errors.first_name = nameError;
    }

    if (intent === "editUser") return errors;

    if (!isValidPassword(password)) {
        errors.password = i18n.t("error_passwordWeak");
    } else if (password != confirm_password) {
        errors.confirm_password = i18n.t("error_passwordNotConfirm");
    }

    return errors;
}


/**
 * Function to validate password and
 * password confirmation inside forms
 * before send fetch request.
 * @param {*} formData 
 * @returns {object}
 */
export function passwordValidation(formData) {
    const errors = {};

    const password = formData.get("password");
    const confirm_password = formData.get("confirm_password");

    if (!isValidPassword(password)) {
        errors.password = i18n.t("error_passwordWeak");
    } else if (password != confirm_password) {
        errors.confirm_password = i18n.t("error_passwordNotConfirm");
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
 * @param {string} password 
 * @returns {boolean}
 */
function isValidPassword(password) {
    const pattern =
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/

    if (pattern.test(password)) {
        return true;
    }
    return false;
}


/**
 * Checks that the name consists only of letters.
 * @param {string} value 
 * @returns {boolean}
 */
function isValidName(name) {
    if (/^[a-zA-Z]+$/.test(name)) {
        return true;
    }
    return false;
}
