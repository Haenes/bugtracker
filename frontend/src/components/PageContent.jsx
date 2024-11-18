import { useContext } from "react";

import { Layout, theme, Button } from "antd";

import {FormOutlined} from "@ant-design/icons";

import { testContext } from "./Page";

const { Content } = Layout;


export function PageContent({ header, children }) {
    const {token: { colorBgContainer, borderRadiusLG }} = theme.useToken();
    const contentStyle = {
        padding: 10,
        background: colorBgContainer,
        borderRadius: borderRadiusLG,
    };
    const handleClickModal = useContext(testContext);

    return (
        <Content className="mx-2 mt-3">
            <div style={contentStyle} className="h-full">
                <div className="flex flex-row items-center">
                    <span className="text-xl">{header}</span>
                    <Button
                        className="items-baseline"
                        title="Create new"
                        type="button"
                        icon={<FormOutlined />}
                        onClick={() => handleClickModal({visible: true, modalId: 1})}
                        size="small"
                    />
                </div>
                <div className="mt-3">{children}</div>
            </div>
        </Content>
    );
}
