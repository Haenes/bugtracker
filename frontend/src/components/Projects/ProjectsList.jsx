import { useState } from "react";

import {
    Link, useActionData, useLoaderData,
    useSubmit, useFetcher, useOutletContext
} from "react-router";

import { useTranslation } from "react-i18next";

import { List, Card, Button, Pagination } from "antd";
import { StarFilled, StarOutlined, SettingOutlined } from "@ant-design/icons";

import { createModal } from "../ModalProvider.jsx";


export function ProjectsList() {
    const projects = useLoaderData();
    const errors = useActionData();
    const submit = useSubmit();

    const { t } = useTranslation();

    const modalTitle = t("projectsList_modalTitle");

    const [modalOpen, setModalOpen] = useOutletContext();
    const [formData, setFormData] = useState(null);

    if (!projects) {
        return (
            <>
                <List />
                {createModal(1, "createProject", modalTitle, errors)}
            </>
        );
    }

    return (
        <>
            <Pagination
                className="mb-5 items-center"
                current={projects.page}
                total={projects.count}
                showTitle={false}
                showSizeChanger={false}
                simple
                hideOnSinglePage
                pageSize={20}
                onChange={(page, pageSize) => submit(`?page=${page}&limit=${pageSize}`)}
            />

            <List
                grid={listGrid}
                dataSource={projects.results}
                renderItem={(item) => {
                    return (
                        <List.Item>
                            <Card
                                title={<Link to={`${item.id}/issues`}>{item.name}</Link>}
                                styles={{body: {padding: 0}}}
                                extra={item.key}
                                actions={[
                                    <FavoriteButton data={{id: item.id, starred: item.starred}} />,
                                    <SettingsButton
                                        project={{...item}}
                                        setFuncs={[setModalOpen, setFormData]}
                                    />
                                ]}
                            />
                        </List.Item>
                    );
                }}
            />

            {createModal(1, "createProject", modalTitle, errors)}
            {createModal(2, "editProject", modalTitle, errors, formData)}
        </>
    );
}


function FavoriteButton({ data }) {
    const fetcher = useFetcher();
    const { t } = useTranslation();

    let favorite = fetcher.formData?.get("starred") || data.starred

    const handleClick = () => {
        fetcher.submit(
            {
                intent: "edit",
                projectId: data.id,
                starred: !data.starred
            },
            {method: "PATCH"}
        );
    };

    return (
        <Button
            htmlType="submit"
            name="starred"
            className="border-0 shadow-none"    
            icon={
                favorite
                ? <StarFilled title={t("projectsList_favoriteTrue")} style={buttonSize}/>
                : <StarOutlined title={t("projectsList_favoriteFalse")} style={buttonSize}/>
            }
            onClick={handleClick}
        />
    );
}


function SettingsButton({ project, setFuncs }) {
    const { t } = useTranslation();
    const [setModalOpen, setFormData] = setFuncs;

    return (
        <Button
            title={t("btn_settings")}
            className="border-0 shadow-none"
            icon={<SettingOutlined style={buttonSize}/>}
            onClick={() => {
                setModalOpen({visible: true, modalId: 2});
                setFormData(project);
            }}
        />
    );
}


const listGrid = {
    gutter: 10,
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
    xxl: 4,
};

const buttonSize = {fontSize: 18};
