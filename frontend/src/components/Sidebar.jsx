import { useState } from "react";

import { Link, useSubmit, useLocation } from "react-router";

import { useTranslation } from "react-i18next";

import {
    SettingOutlined,
    SearchOutlined,
    HomeOutlined,
    LogoutOutlined,
} from "@ant-design/icons";

import { ConfigProvider, Layout, Menu } from "antd";

const { Sider } = Layout;


export function Sidebar() {
    const submit = useSubmit();
    const { t } = useTranslation();
    const location = useLocation().pathname;
    const [collapsed, setCollapsed] = useState(true);
    const menuCompanent = {Menu: {activeBarBorderWidth: 0}};

    const handleClickLogout = () => {
        submit(null, {method: "POST", action: "/logout"});
    }

    const menuItems = [
        {
            key: "1",   
            label: t("sidebar_home"),
            icon: <Link to="/projects"><HomeOutlined /></Link>
        },
        {
            key: "2",
            label: t("sidebar_search"),
            icon:  <SearchOutlined />,
        },
        {
            key: "3",
            label: t("sidebar_settings"),
            icon: <Link to="/settings"><SettingOutlined /></Link>,
        },
        {
            key: "4",
            label: t("sidebar_logOut"),
            icon: <LogoutOutlined />,
            onClick: handleClickLogout
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
