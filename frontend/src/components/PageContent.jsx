import { useTranslation } from "react-i18next";

import { Layout, theme, Button } from "antd";

import { FormOutlined } from "@ant-design/icons";

import { useOutletContext } from "react-router";

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
        <Content className="mx-2 mt-3">
            <div style={contentStyle} className="h-full">
                    <div className="flex flex-row items-center">
                        <span className="text-xl">{header}</span>
                        {header !== "Settings" &&
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

                <div className="mt-3">
                    {children}
                </div>
            </div>
        </Content>
    );
}
