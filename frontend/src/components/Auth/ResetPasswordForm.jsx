import { useState } from "react";

import { Button, Card, Tooltip, Input } from 'antd';

import { Form, useActionData } from "react-router";

import { useTranslation } from "react-i18next";

import { passwordTooltip } from "./RegisterForm.jsx";


export function ResetPasswordForm() {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const { t } = useTranslation();
    const errors = useActionData();

    return (
        <div className="flex flex-col h-screen w-screen items-center justify-center">
            <Card title={t("resetPassword_cardTitle")} className="text-center w-4/5 md:w-2/5 lg:w-1/4">

                <Form method="post" name="forgotPassword" className="flex flex-col">

                    {errors ?
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

                    <Button type="primary" htmlType="submit">
                        {t("resetPassword_button")}
                    </Button>

                </Form>

            </Card>
        </div>
    );
}
