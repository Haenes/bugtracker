import { useState } from "react";

import { useSubmit } from "react-router-dom";

import {
    SettingOutlined,
    HomeOutlined,
    UserOutlined,
} from "@ant-design/icons";

import { ConfigProvider, Layout, Menu } from "antd";

const { Sider } = Layout;


export function Sidebar() {
    const submit = useSubmit();
    const [collapsed, setCollapsed] = useState(true);
    const menuCompanent = {Menu: {activeBarBorderWidth: 0}};

    const handleClickLogout = () => {
        submit(null, {method: "POST", action: "/logout"});
    }

    const menuItems = [
        {
            key: "1",
            label: "Account",
            icon: <UserOutlined />,
            children: [{key: "2", label: "Log out", onClick: handleClickLogout}]
        },
        {
            key: "3",   
            label: "Home",
            icon: <HomeOutlined />
        },
        {
            key: "4",
            label: "Settings",
            icon: <SettingOutlined />
        },
    ];

    return (
        <Sider
            style={siderStyle}
            theme="light"
            collapsible
            collapsed={collapsed}
            onCollapse={() => setCollapsed(!collapsed)}
            collapsedWidth="50"
            width="155"
        >
            <ConfigProvider theme={{components: menuCompanent}}>
                <Menu mode="vertical" items={menuItems} />
            </ConfigProvider>
        </Sider>
    );
}


const siderStyle = {
    overflow: "auto",
    height: "100vh",
    position: "sticky",
    top: 0,
    paddingTop: 8,
    border: 20
};
