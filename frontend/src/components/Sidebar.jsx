import { useState } from 'react';
import {
    SettingOutlined,
    // FormOutlined,
    HomeOutlined,
    UserOutlined,
} from '@ant-design/icons';

import { Layout, Menu } from 'antd';

const { Sider } = Layout;


function getItem(label, key, icon, children) {
  return {key, icon, children, label};
}


export function Sidebar({ children }) {
    const siderStyle = {
        overflow: "auto",
        height: "100vh",
        position: "sticky",
        top: 0,
        paddingTop: 8
    };
    const [collapsed, setCollapsed] = useState(true);

    const items = [
        getItem("Account", 1, <UserOutlined />, [getItem("Log out", 2)]),
        getItem("Home", 3, <HomeOutlined />),
        // isIssue ? getItem("Create issue", 4, <FormOutlined />) : getItem("Create project", 4, <FormOutlined />),
        getItem("Settings", 4, <SettingOutlined />)
      ];

    return (
        <Layout hasSider>
            <Sider
                style={siderStyle}
                theme='light'
                collapsible
                collapsed={collapsed}
                onCollapse={() => setCollapsed(!collapsed)}
                collapsedWidth="50"
                width="155"
                >
                    <Menu mode="vertical" triggerSubMenuAction="click" items={items}/>
            </Sider>

            {children}
        </Layout>
    );
}
