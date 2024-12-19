export const authProvider = {
    jwtLifetime: localStorage.getItem("jwtLifetime"),

    signIn(isRemember) {
        // Add 3 hr or 3 weeks (JWT lifetime) to current time - 1 min
        // for all sort of delays.
        const THREE_HOURS = Date.now() + 10_740_000;
        const MONTH = Date.now() + 1_814_340_000;
        let expire;

        isRemember ? expire = MONTH : expire = THREE_HOURS;

        localStorage.setItem("jwtLifetime", expire);
        this.jwtLifetime = expire;
    },

    signOut() {
        localStorage.removeItem("jwtLifetime");
        this.jwtLifetime = false;
    }
};
