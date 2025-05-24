import { useEffect, useState } from "react"

import { Form, useFetcher } from "react-router";

import { useTranslation } from "react-i18next";

import { Button, Checkbox, Tabs, List, Input, Popconfirm } from 'antd';

import { getProjectUsers } from "../../client/base.js";
import { convertDate } from "../PageLayout.jsx";

const { TextArea } = Input;


export function EditProjectForm({ project, errors, setModalOpen }) {
    const fetcher = useFetcher();
    const { t } = useTranslation();

    const handleDelete = () => {
        setModalOpen({visible: false, modalId: 2});
        fetcher.submit(
            {intent: "delete", projectId: project.id},
            {method: "DELETE"}
        );
    };

    return (
        <Form method="post" name="editProject">
            {errors?.editName || errors?.editKey ?
                <div className='text-center text-red-500'>
                    {errors?.editName}
                    {errors?.editKey}
                </div> : <></>
            }

            <input name="projectId" value={project.id} type="hidden" />

            <label>{t("name")}</label>
            <Input
                name="name"
                className="mb-3"
                status={errors?.name && "error"}
                type="text"
                defaultValue={project.name}
                required
                minLength={3}
            />

            <label>{t("editProject_key")}</label>
            <Input
                name="key"
                className="mb-3"
                status={errors?.editKey && "error"}
                type="text"
                defaultValue={project.key}
                required
                minLength={3}
                maxLength={10}
            />

            <label>{t("description")}</label>
            <TextArea
                name="description"
                className="mb-3"
                defaultValue={project.description}
                placeholder={t("editEmptyDescription")}
            />

            <label className="mr-2">{t("editProject_favorite")}</label>
            <Checkbox className="mb-3" name="is_favorite" defaultChecked={project.is_favorite} />

            <div className="mb-3">
                <label className="mr-2">{t("editCreated")}</label>
                {convertDate(project.created_at)}
            </div>

            <div className="mb-3">
                <label className="mr-2">{t("editUpdated")}</label>
                {/* Get updated datetime from PATCH response to synchronize data */}
                {errors?.created_at == project.created_at ?
                    convertDate(errors.updated_at) :
                    convertDate(project.updated_at)
                }
            </div>

            <div className="flex flex-row gap-3 justify-end">
                <Popconfirm
                    title={t("confirm_title")}
                    description={t("confirm_description")}
                    cancelText={t("confirm_cancel")}
                    okText={t("confirm_ok")}
                    onConfirm={handleDelete}
                >
                    <Button
                        danger
                        name="intent"
                        value="delete"
                        type="text"
                    >
                        {t("btn_delete")}
                    </Button>
                </Popconfirm>

                <Button name="intent" value="edit" type="primary" htmlType="submit">
                    {t("btn_change")}
                </Button>
            </div>
        </Form>
    );
}


export function ProjectParticipants({ projectId }) {
    const [users, setUsers] = useState([])
    // const fetcher = useFetcher();

    const fetchUsers = async () => {
        const users = await getProjectUsers(projectId);
        setUsers(users)
    };

    useEffect(() => {fetchUsers()}, [])

    // Add ability to change role and delete from project
    // Add field for invite new user to project by username/email
    return (
        <List
            itemLayout="horizontal"
            dataSource={users}
            renderItem={user => (
                <List.Item
                    actions={[
                        <a key="change-role">Change role</a>,
                        <a key="delete-user">Delete</a>
                    ]}
                >
                    <List.Item.Meta title={user.username} />
                    <div>{user.role_id}</div>
                </List.Item>
            )}
        />
    )
}


export function ProjectSettings({ project, errors, setModalOpen }) {
    const { t } = useTranslation();
    const items = [
        {
            label: t("projectSettingsDetails"),
            key: 1,
            children: <EditProjectForm project={project} errors={errors} setModalOpen={setModalOpen} />
        },
        {
            label: t("projectSettingsParticipants"),
            key: 2,
            children: <ProjectParticipants projectId={project.id}/>
        }
    ];

    return (
        <Tabs
            tabPosition={"top"}
            items={items.map((_, i) => {return items[i]})}
        />
    )
}
