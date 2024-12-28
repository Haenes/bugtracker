import { useTranslation } from "react-i18next";

import { useOutletContext } from "react-router";

import { Layout, theme, Button } from "antd";
import { FormOutlined } from "@ant-design/icons";


const { Content } = Layout;


export function PageContent({ header, children }) {
    const {token: { colorBgContainer, borderRadiusLG }} = theme.useToken();
    const contentStyle = {
        padding: 10,
        background: colorBgContainer,
        borderRadius: borderRadiusLG,
    };
    const { t } = useTranslation();
    const [modalOpen, setModalOpen] = useOutletContext();

    return (
        <Content className="m-2">
            <div style={contentStyle} className="flex flex-col h-full w-full">
                    <div className="flex items-center">
                        <span className="text-xl">{header}</span>
                        {header !== t("settings_header") &&
                            <Button
                                className="items-baseline"
                                title={t("btn_create")}
                                type="button"
                                icon={<FormOutlined />}
                                onClick={() => setModalOpen({visible: true, modalId: 1})}
                                size="small"
                            />
                        }
                    </div>

                <div className="flex-grow mt-3">
                    {children}
                </div>
            </div>
        </Content>
    );
}
