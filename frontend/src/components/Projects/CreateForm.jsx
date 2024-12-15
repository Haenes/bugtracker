import { useEffect } from 'react';

import { Button, Checkbox, Input } from 'antd';

import { Form } from "react-router";

import { useTranslation } from "react-i18next";



export function CreateProjectForm({errors, setModalOpen}) {
    const { t } = useTranslation();

    // Close Modal with form after successful creation.
    useEffect(() => {
        if (errors?.id) {
            setModalOpen({visible: false, modalId: 1});
            delete errors.id;
        }
    }, [errors])

    return (
        <Form method="post" name="createProject" className="flex flex-col gap-y-4 w-full">

            {errors?.createName || errors?.createKey ?
                <div className='text-center text-red-500'>
                    {errors?.createName}
                    {errors?.createKey}
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
