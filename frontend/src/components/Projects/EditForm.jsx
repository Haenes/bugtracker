import { useState } from 'react';

import { Form, useFetcher } from "react-router";

import { useTranslation } from "react-i18next";

import { Button, Select, Checkbox, Input } from 'antd';

import { convertDate } from "../PageLayout.jsx";


export function EditProjectForm({ project, errors, setModalOpen }) {
    const fetcher = useFetcher();
    const { t } = useTranslation();
    const [type, setType] = useState(project.type);

    const handleDelete = () => {
        setModalOpen({visible: false, modalId: 2});
        fetcher.submit(
            {intent: "delete", projectId: project.id},
            {method: "POST"}
        )
    };

    return (
        <Form method="post" name="editProject" className="flex flex-col gap-3 mt-4">
            {errors?.editName || errors?.editKey ?
                <div className='text-center text-red-500'>
                    {errors?.editName}
                    {errors?.editKey}
                </div> : <></>
            }

            <input name="projectId" value={project.id} type="hidden" />

            <div className="flex flex-row items-center">
                <span className="mr-2">{t("editProject_name")}</span>
                <Input
                    name="name"
                    status={errors?.editName && "error"}
                    type="text"
                    defaultValue={project.name}
                    required
                    minLength={3}
                />
            </div>

            <div className="flex flex-row items-center w-2/3">
                <span className="mr-2">{t("editProject_key")}</span>
                <Input
                    name="key"
                    status={errors?.editKey && "error"}
                    type="text"
                    defaultValue={project.key}
                    required
                    minLength={3}
                    maxLength={10}
                />
            </div>

            <div className="items-center">
                <span className="mr-2">{t("editProject_type")}</span>
                <Select
                    defaultValue={project.type}
                    options={[
                        {label: t("project_typeFullstack"), value: "Fullstack"},
                        {label: t("project_typeBackend"), value: "Back-end"},
                        {label: t("project_typeFrontend"), value: "Front-end"}
                    ]}
                    onChange={value => setType(value)}
                />
                <input name="type" type="hidden" value={type} />
            </div>

            <div>
                <span className="mr-2">{t("editProject_favorite")}</span>
                <Checkbox name="starred" defaultChecked={project.starred} />
            </div>

            <div>
                <span className="mr-2">{t("editCreated")}</span>
                {convertDate(project.created)}
            </div>

            <div>
                <span className="mr-2">{t("editUpdated")}</span>
                {/* Get updated datetime from PATCH response to synchronize data */}
                {errors?.created == project.created ?
                    convertDate(errors.updated) :
                    convertDate(project.updated)
                }
            </div>

            <div className="flex flex-row gap-3 justify-end">
                <Button
                    danger
                    name="intent"
                    value="delete"
                    type="text"
                    onClick={handleDelete}
                >
                    {t("btn_delete")}
                </Button>

                <Button name="intent" value="edit" type="primary" htmlType="submit">
                {t("btn_change")}
                </Button>
            </div>
        </Form>
    );
}