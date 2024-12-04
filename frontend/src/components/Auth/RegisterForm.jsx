import { useState } from "react";

import { Form, Link, useActionData } from "react-router";

import { Trans, useTranslation } from "react-i18next";

import { Button, Card, Input, Tooltip } from "antd";


export function RegisterForm() {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const errors = useActionData();
    const { t } = useTranslation();

    return (
        <div className="flex flex-col h-screen w-screen items-center justify-center">
            <Card title={t("register_cardTitle")}>
                <Form method="post" name="register" className="flex flex-col gap-y-4">

                    {errors ?
                        <div className="flex flex-col text-center text-red-500">
                            <span>{errors?.email}</span>
                            <span>{errors?.username}</span>
                            <span>{errors?.first_name}</span>
                            <span>{errors?.last_name}</span>
                            <span>{errors?.password}</span>
                            <span>{errors?.confirm_password}</span>
                        </div> : <></>
                    }

                    <Input
                        name="email"
                        autoComplete="email"
                        status={errors?.email && "error"}
                        type="email"
                        placeholder={t("email")}
                        autoFocus
                        required
                    />

                    <Input
                        name="username"
                        autoComplete="nickname"
                        status={errors?.username && "error"}
                        type="text"
                        placeholder={t("register_username")}
                        minLength={4}
                        required
                    />

                    <Input
                        name="first_name"
                        autoComplete="given-name"
                        status={errors?.first_name && "error"}
                        type="text"
                        placeholder={t("register_firstName")}
                        autoCapitalize="on"
                        minLength={2}
                        required
                    />

                    <Input
                        name="last_name"
                        autoComplete="family-name"
                        status={errors?.last_name && "error"}
                        type="text"
                        placeholder={t("register_lastName")}
                        autoCapitalize="on"
                        minLength={2}
                        required
                    />

                    <Tooltip title={passwordTooltip}>
                        <Input.Password
                            name="password"
                            autoComplete="new-password"
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
                        type="password"
                        placeholder={t("confirmPassword")}
                        minLength={8}
                        maxLength={32}
                        required
                        visibilityToggle={() => (!setPasswordVisible)}
                    />

                    <Button block type="primary" htmlType="submit">
                        {t("register_btn")}
                    </Button>

                    <div className="text-center">
                        <Link to="/login">{t("returnToLogin")}</Link>
                    </div>

                </Form>
            </Card>
        </div>
    );
}


export const passwordTooltip = (
    <div>
        <Trans i18nKey="passwordTooltip">
            Your password must have:
            <p>1) a 8 - 32 characters.</p>
            <p>2) at least one uppercase and lowercase letters.</p>
            <p>3) at least one digit.</p>
            <p>4) at least one special character</p>
        </Trans>
    </div>
);
