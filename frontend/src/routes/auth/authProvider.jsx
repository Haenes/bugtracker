export const authProvider = {
    isAuth: localStorage.getItem("isAuth"),

    setTrue() {
        localStorage.setItem("isAuth", true);
        this.isAuth = true;
    },

    setFalse() {
        localStorage.removeItem("isAuth");
        this.isAuth = false;
    }
};
