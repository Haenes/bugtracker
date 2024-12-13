import { useEffect } from 'react';

import { Button, Input, Popconfirm } from 'antd';

import {
    Form, useActionData, useLoaderData,
    useFetcher, useOutletContext
} from "react-router";

import { useTranslation } from "react-i18next";


export function AccountForm() {
    const user = useLoaderData();
    const fetcher = useFetcher();
    const errors = useActionData();
    const { t } = useTranslation();
    const [modalOpen, setModalOpen] = useOutletContext();

    const handleChangePassword = () => {
        setModalOpen({visible: true, modalId: 3});
    };

    const handleAccDelete = () => {
        fetcher.submit({intent: "delete"}, {method: "POST"});
    };

    // Close Modal with form after successful change of password.
    useEffect(() => {
        if (errors === "passwordChanged") {
            setModalOpen({visible: false, modalId: 3});
        }
    }, [errors])

    return (
        <Form method="post" name="account" className="flex flex-col gap-y-4 md:w-2/5">

            {errors?.email || errors?.username ||
            errors?.first_name || errors?.last_name ?
                <div className="flex flex-col text-center text-red-500">
                    <span>{errors?.email}</span>
                    <span>{errors?.username}</span>
                    {errors?.first_name && errors?.last_name &&
                        <span>{errors?.first_name}</span>
                    }
                    <span>{!errors?.last_name && errors?.first_name}</span>
                    <span>{!errors?.first_name && errors?.last_name}</span>
                </div> : <></>
            }

            <div className="flex flex-row items-center">
                <span className="mr-2 text-nowrap">{t("email")}:</span>
                <Input
                    name="email"
                    status={errors?.email && "error"}
                    type="email"
                    defaultValue={user.email}
                    autoFocus
                    required
                />
            </div>

            <div className="flex flex-row items-center">
                <span className="mr-2">{t("username")}:</span>
                <Input
                    name="username"
                    status={errors?.username && "error"}
                    type="text"
                    defaultValue={user.username}
                    minLength={4}
                    required
                />
            </div>

            <div className="flex flex-row items-center">
                <span className="mr-2 text-nowrap">{t("firstName")}:</span>
                <Input
                    name="first_name"
                    status={errors?.first_name && "error"}
                    type="text"
                    defaultValue={user.first_name}
                    autoCapitalize="on"
                    minLength={2}
                    required
                />
            </div>

            <div className="flex flex-row items-center">
                <span className="mr-2 text-nowrap">{t("lastName")}:</span>
                <Input
                    name="last_name"
                    status={errors?.last_name && "error"}
                    type="text"
                    defaultValue={user.last_name}
                    autoCapitalize="on"
                    minLength={2}
                    required
                />
            </div>

            <div className="flex flex-row flex-wrap gap-3">
                <Popconfirm
                    title="Are you sure?"
                    description="This action is irreversible"
                    cancelText={t("confirm_cancel")}
                    okText={t("confirm_ok")}
                    onConfirm={handleAccDelete}
                >
                    <Button danger type="link">
                        {t("btn_delete")}
                    </Button>
                </Popconfirm>

                <Button
                    type="link"
                    onClick={handleChangePassword}
                >
                    {t("btn_changePassword")}
                </Button>

                <Button
                    name="intent"
                    value="edit"
                    type="primary"
                    htmlType="submit"
                >
                    {t("btn_change")}
                </Button>
            </div>

        </Form>
    );
}
