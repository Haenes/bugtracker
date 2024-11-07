import { useState } from 'react';
import {
    SettingOutlined,
    FormOutlined,
    HomeOutlined,
    UserOutlined,
} from '@ant-design/icons';

import { ConfigProvider, Layout, Menu, Modal } from 'antd';
import { ProjectForm } from './ProjectForm';

const { Sider } = Layout;


export function Sidebar({ children }) {
    const [collapsed, setCollapsed] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    const siderStyle = {
        overflow: "auto",
        height: "100vh",
        position: "sticky",
        top: 0,
        paddingTop: 8,
        border: 20
    };
    const menuItems = [
        {
            key: "1",
            label: "Account",
            icon: <UserOutlined />,
            children: [{key: "2", label: "Log out"}]
        },
        {
            key: "3",
            label: "Home",
            icon: <HomeOutlined />
        },
        {
            key: "4",
            label: "Create project",
            icon: <FormOutlined />,
            onClick: () => setModalOpen(true)
        },
        {
            key: "5",
            label: "Settings",
            icon: <SettingOutlined />
        },
    ];

    return (
        <>
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
                    <ConfigProvider theme={{
                        components: {Menu: {activeBarBorderWidth: 0}}
                    }}>
                        <Menu mode="vertical" items={menuItems}/>
                    </ConfigProvider>
                </Sider>

                {children}
            </Layout>

            <Modal
                title={menuItems[2].label}
                centered
                width={300}
                open={modalOpen}
                footer={null}
                destroyOnClose={true}
                onCancel={() => setModalOpen(false)}
            >
                <ProjectForm onCreate={() => setModalOpen(false)}/>
            </Modal>
        </>
    );
}
