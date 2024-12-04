import i18n from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";


export const supportedLngs = {
    "en": "English",
    "ru": "Russian",
};


i18n
    .use(LanguageDetector)
    .use(resourcesToBackend(
        (language, namespace) => import(`./locales/${language}/${namespace}.json`)
    ))
    .use(initReactI18next)
    .init({
        fallbackLng: {
            "default": ["en"]
        },
        supportedLngs: Object.keys(supportedLngs),
        interpolation: {
            escapeValue: false,
        },
    });


export default i18n;
