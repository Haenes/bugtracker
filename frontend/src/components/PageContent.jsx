import { useTranslation } from "react-i18next";

import { useOutletContext, useParams } from "react-router";

import { Layout, theme, Button } from "antd";
import { FormOutlined } from "@ant-design/icons";

import { CreateModal } from "./ModalProvider.jsx";
import { SearchForm } from "./SearchForm.jsx";

const { Content } = Layout;


export function PageContent({ header, children }) {
    const {token: { colorBgContainer, borderRadiusLG }} = theme.useToken();
    const { t } = useTranslation();
    const params = useParams();
    const [modalOpen, setModalOpen] = useOutletContext();
    const contentStyle = {
        padding: 10,
        background: colorBgContainer,
        borderRadius: borderRadiusLG,
    };
    
    // Examples:
    // project-132 -> ["project", "132"] -> "project"
    // project-name-132 -> ["project", "name", "132"] -> "project-name"
    let isProjectName = params?.projectId?.split("-").slice(0,-1).join("-");

    return (
        <Content className="m-2">
            <div style={contentStyle} className="flex flex-col size-full">
                <div className="flex items-center">
                    <span className="text-xl">
                        {isProjectName ? isProjectName : header}
                    </span>

                    {header !== t("settings_header")
                        && header !== t("search_header") &&
                        <Button
                            className="items-baseline"
                            title={t("btn_create")}
                            type="button"
                            icon={<FormOutlined />}
                            onClick={() => setModalOpen(
                                {visible: true, modalId: 1}
                            )}
                            size="small"
                        />
                    }
                </div>

                <div className="flex-grow mt-2">
                    {children}
                </div>
            </div>

            <CreateModal modalId={4}>
                <SearchForm setModalOpen={setModalOpen}/>
            </CreateModal>
        </Content>
    );
}
