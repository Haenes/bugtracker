import { Form, useFetcher } from "react-router";

import { useTranslation } from "react-i18next";

import { Button, Checkbox, Input, Popconfirm } from 'antd';

import { convertDate } from "../PageLayout.jsx";


export function EditProjectForm({ project, errors, setModalOpen }) {
    const fetcher = useFetcher();
    const { t } = useTranslation();

    const handleDelete = () => {
        setModalOpen({visible: false, modalId: 2});
        fetcher.submit(
            {intent: "delete", projectId: project.id},
            {method: "POST"}
        );
    };

    return (
        <Form method="post" name="editProject" className="flex flex-col gap-y-3 mt-4">
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

            <div className="flex flex-row items-center w-3/5 md:w-2/5">
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