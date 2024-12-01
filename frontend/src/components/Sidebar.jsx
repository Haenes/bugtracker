import { useState } from "react";

import { Link, useSubmit, useLocation } from "react-router";

import {
    SettingOutlined,
    HomeOutlined,
    LogoutOutlined,
    SunOutlined, MoonOutlined
} from "@ant-design/icons";

import { ConfigProvider, Layout, Menu } from "antd";

const { Sider } = Layout;


export function Sidebar() {
    const submit = useSubmit();
    const location = useLocation().pathname;
    const [collapsed, setCollapsed] = useState(true);
    const menuCompanent = {Menu: {activeBarBorderWidth: 0, dropdownWidth: 1}};

    const handleClickLogout = () => {
        submit(null, {method: "POST", action: "/logout"});
    }

    const handleClickMode = () => {
        let currentColorMode = localStorage.getItem("colorMode");
        
        if (!currentColorMode) currentColorMode = "light";

        localStorage.setItem(
            "colorMode",
            currentColorMode === "dark" ? "light" : "dark"
        );
        window.location.reload();
    };

    const menuItems = [
        {
            key: "1",   
            label: "Home",
            icon: <Link to="/projects"><HomeOutlined /></Link>
        },
        {
            key: "2",
            label: "Settings",
            icon: <SettingOutlined />
        },
        {
            key: "3",
            label: "Log out",
            icon: <LogoutOutlined />,
            onClick: handleClickLogout
        },
        {
            key: "4",
            label: "Color mode",
            icon: localStorage.getItem("colorMode") === "dark" ?
                <SunOutlined /> : <MoonOutlined />,
            onClick: handleClickMode
        }
    ];

    return (
        <Sider
            style={siderStyle}
            theme="light"
            collapsible
            collapsed={collapsed}
            onCollapse={() => setCollapsed(!collapsed)}
            collapsedWidth="50"
            width="135"
        >
            <ConfigProvider theme={{components: menuCompanent}}>
                <Menu
                    mode="vertical"
                    selectedKeys={location === "/projects" && "1"}
                    items={menuItems}
                />
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
