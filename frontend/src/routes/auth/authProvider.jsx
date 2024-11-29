export const authProvider = {
    jwtLifetime: localStorage.getItem("jwtLifetime"),

    signIn() {
        // Add 2:59 hr (1 min for all sort of delays)
        // (JWT lifetime) to current time.
        const expire = new Date().getTime() + 10_740_000;
    
        localStorage.setItem("jwtLifetime", expire);
        this.jwtLifetime = expire;
    },

    signOut() {
        localStorage.removeItem("jwtLifetime");
        this.jwtLifetime = false;
    }
};
