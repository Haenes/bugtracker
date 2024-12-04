import { useState, useEffect } from 'react';

import { Button, Select, Checkbox, Input } from 'antd';

import { Form } from "react-router";

import { useTranslation } from "react-i18next";



export function CreateProjectForm({errors, setModalOpen}) {
    const { t } = useTranslation();
    const [type, setType] = useState("");

    const handleChange = () => {
        errors?.createType && delete errors.createType;
    };

    // Close Modal with form after successful creation.
    useEffect(() => {
        if (errors?.id) {
            setModalOpen({visible: false, modalId: 1});
            delete errors.id;
        }
    }, [errors])

    return (
        <Form method="post" name="createProject" className="flex flex-col gap-y-4 w-full">

            {errors?.createName || errors?.createKey || errors?.createType ?
                <div className='text-center text-red-500'>
                    {errors?.createName}
                    {errors?.createKey}
                    {errors?.createType}
                </div> : <></>
            }

            <Input
                name="name"
                status={errors?.createName && "error"}
                type="text"
                placeholder={t("createProject_name")}
                required
                minLength={3}
            />

            <Input
                name="key"
                status={errors?.createKey && "error"}
                type="text"
                placeholder={t("createProject_key")}
                required
                minLength={3}
                maxLength={10}
            />

            <Select
                placeholder={t("createProject_type")}
                status={errors?.createType && "error"}
                options={[
                    {label: t("project_typeFullstack"), value: "Fullstack"},
                    {label: t("project_typeBackend"), value: "Back-end"},
                    {label: t("project_typeFrontend"), value: "Front-end"}
                ]}
                onChange={value => {setType(value), handleChange()}}
            />
            {
                /*
                That input field helps to circumvent the Select
                restriction, which makes it impossible to pass the name
                with the selected option value inside the form
                */
            }
            <input name="type" type="hidden" value={type} />

            <Checkbox name="starred">{t("createProject_favorite")}</Checkbox>

            <Button
                name="intent"
                value="create"
                className="self-center"
                type="primary"
                htmlType="submit"
            >
                {t("btn_create")}
            </Button>
        </Form>
    );
}
