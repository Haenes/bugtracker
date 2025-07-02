import { useTranslation } from "react-i18next";

import { Tabs, Segmented} from "antd";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";

import { AccountForm } from "./Auth/AccountForm.jsx";
import { PageContent } from "../components/PageContent.jsx";
import { CreateModal } from "../components/ModalProvider.jsx";
import { ChangePasswordForm } from "../components/Auth/ChangePasswordForm.jsx";


export function Settings() {
    const { t } = useTranslation();

    const items = [
        {label: t("settingsTab1"), key: 1, children: <AccountForm />},
        {
            label: t("settingsTab2"),
            key: 2,
            children: <PreferencesTab colorMode={localStorage.getItem("colorMode")} />
        }
    ]

    return (
        <PageContent header={t("settingsHeader")}>
            <Tabs
                tabPosition={"top"}
                items={items.map((_, i) => {return items[i]})}
            />

            <CreateModal modalId={3} title={t("settingsChangePassword")}>
                <ChangePasswordForm />
            </CreateModal>
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
                <span className="mr-2">{t("settingsColorMode")}:</span>

                <Segmented
                    options={[
                        {
                            label: t("settingsColorModeLight"),
                            value: "light",
                            icon: <SunOutlined />
                        },
                        {
                            label: t("settingsColorModeDark"),
                            value: "dark",
                            icon: <MoonOutlined />
                        }
                    ]}
                    value={localStorage.getItem("colorMode")}
                    onChange={(mode) => handleClickMode(mode)}
                />
            </div>

            <div className="flex flex-row items-center w-2/3">
                <span className="mr-2">{t("settingsLang")}:</span>

                <Segmented
                    options={[
                        {label: t("settingsLangEn"), value: "en"},
                        {label: t("settingsLangRu"), value: "ru"},
                    ]}
                    value={localStorage.getItem("i18nextLng")}
                    onChange={(lang) => handleClickLang(lang)}
                />
            </div>
        </>
    )
}
