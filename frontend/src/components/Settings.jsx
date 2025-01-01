import { useTranslation } from "react-i18next";

import { Tabs, Segmented} from "antd";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";

import { AccountForm } from "./Auth/AccountForm.jsx";
import { PageContent } from "../components/PageContent.jsx";
import { createModal } from "../components/ModalProvider.jsx";


export function Settings() {
    const { t } = useTranslation();

    const items = [
        {label: t("settings_tab1"), key: 1, children: <AccountForm />},
        {
            label: t("settings_tab2"),
            key: 2,
            children: <PreferencesTab colorMode={localStorage.getItem("colorMode")} />
        }
    ]

    return (
        <PageContent header={t("settings_header")}>
            <Tabs
                tabPosition={"top"}
                items={items.map((_, i) => {return items[i]})}
            />

            {createModal(3, "changePassword", t("settings_changePassword"))}
        </PageContent>
    );
}


function PreferencesTab() {
    const { t, i18n } = useTranslation();

    const handleClickMode = (mode) => {
        localStorage.setItem("colorMode", mode);
        window.location.reload();
    };

    const handleClickLang = (lang) => i18n.changeLanguage(lang);

    return (
        <>
            <div className="flex flex-row items-center mb-3">
                <span className="mr-2">{t("settings_colorMode")}:</span>

                <Segmented
                    options={[
                        {
                            label: t("settings_light"),
                            value: "light",
                            icon: <SunOutlined />
                        },
                        {
                            label: t("settings_dark"),
                            value: "dark",
                            icon: <MoonOutlined />
                        }
                    ]}
                    value={localStorage.getItem("colorMode")}
                    onChange={(mode) => handleClickMode(mode)}
                />
            </div>

            <div className="flex flex-row items-center w-2/3">
                <span className="mr-2">{t("settings_lang")}:</span>

                <Segmented
                    options={[
                        {label: t("settings_en"), value: "en"},
                        {label: t("settings_ru"), value: "ru"},
                    ]}
                    value={localStorage.getItem("i18nextLng")}
                    onChange={(lang) => handleClickLang(lang)}
                />
            </div>
        </>
    )
}