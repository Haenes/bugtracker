import { Layout, theme } from 'antd';

const { Content } = Layout


export function PageContent({ children }) {
    const {token: { colorBgContainer, borderRadiusLG },} = theme.useToken();
    const contentStyle = {
        padding: 10,
        background: colorBgContainer,
        borderRadius: borderRadiusLG,
    };

    return (
        <Content className="px-2 pt-3">
            <div style={contentStyle} className="h-full">
                {children}
            </div>
        </Content>
    );
}
