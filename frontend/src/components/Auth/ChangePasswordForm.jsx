import { useState } from "react";

import { Form, useActionData } from "react-router";

import { useTranslation } from "react-i18next";

import { Button, Tooltip, Input } from 'antd';

import { passwordTooltip } from "./RegisterForm.jsx";


export function ChangePasswordForm() {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const { t } = useTranslation();
    const errors = useActionData();

    return (
        <Form method="post" name="changePassword" className="flex flex-col">

            {errors?.password || errors?.confirm_password ?
                <div className="mb-4 text-center text-red-500">
                    <span>{errors?.password}</span>
                    <span>{errors?.confirm_password}</span>
                </div> : <></>
            }

            <Tooltip title={passwordTooltip}>
                <Input.Password
                    name="password"
                    autoComplete="new-password"
                    autoFocus
                    status={errors?.password && "error"}
                    type="password"
                    placeholder={t("password")}
                    minLength={8}
                    maxLength={32}
                    required
                    visibilityToggle={() => (!setPasswordVisible)}
                />
            </Tooltip>

            <Input.Password
                name="confirm_password"
                autoComplete="new-password"
                status={errors?.confirm_password && "error"}
                className="my-4"
                type="password"
                placeholder={t("confirmPassword")}
                minLength={8}
                maxLength={32}
                required
                visibilityToggle={() => (!setPasswordVisible)}
            />

            <Button
                name="intent"
                value="changePassword"
                className="self-center"
                type="primary"
                htmlType="submit"
            >
                {t("btn_change")}
            </Button>

        </Form>
    );
}