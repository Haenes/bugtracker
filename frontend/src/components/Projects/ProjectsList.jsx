import { useState } from "react";

import {
    Link, useActionData, useLoaderData,
    useSubmit, useOutletContext
} from "react-router";

import { useTranslation } from "react-i18next";

import { List, Card, Button } from "antd";
import { StarFilled, StarOutlined, SettingOutlined } from "@ant-design/icons";

import { CreateProjectForm } from "./CreateForm.jsx";
import { EditProjectForm } from "./EditForm.jsx";

import { CreateModal } from "../ModalProvider.jsx";


export function ProjectsList() {
    const projects = useLoaderData();
    const errors = useActionData();
    const submit = useSubmit();

    const { t } = useTranslation();

    const modalTitle = t("projectsList_modalTitle");

    const [modalOpen, setModalOpen] = useOutletContext();
    const [formData, setFormData] = useState(null);

    const createModal = () => {
        return (
            <CreateModal modalId={1} title={modalTitle} errors={errors}>
                <CreateProjectForm errors={errors} setModalOpen={setModalOpen} />
            </CreateModal>
        );
    }

    if (!projects) {
        return (
            <>
                <List />
                {createModal()}
            </>
        );
    }

    const paginationParams = {
        current: projects.page,
        total: projects.count,
        pageSize: 20,
        position: "bottom",
        align: "center",
        showTitle: false,
        showSizeChanger: false,
        simple: true,
        hideOnSinglePage: true,
        onChange: (page, pageSize) => submit(`?page=${page}&limit=${pageSize}`)
    }

    return (
        <>
            <List
                grid={listGrid}
                pagination={paginationParams}
                dataSource={projects.results}
                renderItem={(item) => {
                    return (
                        <List.Item>
                            <Card
                                title={<Link to={`${item.id}/issues`}>{item.name}</Link>}
                                hoverable
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

            {createModal()}

            <CreateModal modalId={2} title={modalTitle} errors={errors}>
                <EditProjectForm project={formData} errors={errors} setModalOpen={setModalOpen} />
            </CreateModal>
        </>
    );
}


function FavoriteButton({data}) {
    const submit = useSubmit();

    const handleClick = () => {
        submit(
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
            icon={isFavorite(data.starred)}
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


function isFavorite(bool) {
    const { t } = useTranslation();

    return bool ?
        <StarFilled title={t("projectsList_favoriteTrue")} style={buttonSize}/> :
        <StarOutlined title={t("projectsList_favoriteFalse")} style={buttonSize}/>
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
