import { Layout, theme } from 'antd';


const { Content } = Layout


export function PageContent({ header, children }) {
    const {token: { colorBgContainer, borderRadiusLG },} = theme.useToken();
    const contentStyle = {
        padding: 10,
        background: colorBgContainer,
        borderRadius: borderRadiusLG,
    };

    return (
        <Content className="mx-2 mt-3">
            <div style={contentStyle} className="h-full">
                <span className="text-xl">{header}</span>
                <div className="mt-3">{children}</div>
            </div>
        </Content>
    );
}
