/**
 * Function to validate data from form
 * before send fetch request
 * @param {*} formData 
 * @returns {object}
 */
export function formValidation(formData, intent) {
    const errors = {};

    const first_name = formData.get("first_name");
    const last_name = formData.get("last_name");
    const password = formData.get("password");
    const confirm_password = formData.get("confirm_password");

    if (!validatePassword(password)) {
        errors.password = "Password doesn't meet the conditions";
    } else if (password != confirm_password) {
        errors.confirm_password = "Password confirmation is wrong";
    }

    if (intent === "resetPassword") return errors;

    if (!validateName(first_name) && !validateName(last_name)) {
        errors.first_name = "Only letters are allowed";
    } else if (!validateName(first_name)) {
        errors.first_name = "Only letters are allowed";
    } else if (!validateName(last_name)) {
        errors.last_name = "Only letters are allowed";
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
function validatePassword(password) {
    const pattern =
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/

    if (pattern.test(password)) {
        return true;
    }
    return false;
}


/**
 * Checks that the name consists only of letters
 * @param {string} value 
 * @returns {boolean}
 */
function validateName(name) {
    if (/^[a-zA-Z]+$/.test(name)) {
        return true;
    }
    return false;
}
