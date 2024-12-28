import { useState } from 'react';

import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Card, Button, Checkbox, Input, Spin } from 'antd';

import { Form, Link, useActionData, useNavigation } from "react-router";

import { useTranslation } from "react-i18next";


export function LoginForm({ children }) {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const errors = useActionData();
    const navigation = useNavigation();
    const {t} = useTranslation();

    return (
        <div className="flex flex-col h-screen w-screen items-center justify-center">
            {navigation.state === "loading" && <Spin fullscreen delay={50}/>}

            <div className="mb-5">{children}</div>

            <Card title={t("login_cardTitle")}>
                <Form method="post" name="login" className="flex flex-col gap-y-4">

                    {errors &&
                        <div className="text-center text-red-500">
                            {errors?.auth}
                            {errors?.verify}
                        </div>
                    }

                    <Input
                        // It's not a mistake (auth-lib asks email in username form input...)
                        name="username"
                        autoComplete="email"
                        status={errors?.auth && "error"}
                        type="email"
                        placeholder={t("email")}
                        autoFocus
                        required
                        prefix={<UserOutlined />}
                    />

                    <Input.Password
                        name="password"
                        autoComplete="current-password"
                        status={errors?.auth && "error"}
                        type="password"
                        placeholder={t("password")}
                        minLength={8}
                        required
                        prefix={<LockOutlined />}
                        visibilityToggle={() => (!setPasswordVisible)}
                    />

                    <Checkbox name="remember">{t("login_rememberMe")}</Checkbox>

                    <Button
                        loading={navigation.state === "submitting" & 50}
                        block
                        type="primary"
                        htmlType="submit"
                    >
                        {t("btn_logIn")}
                    </Button>

                    <div className="flex flex-row gap-x-10">
                        <Link to="/forgot-pasword">{t("login_forgotPassword")}</Link>
                        <Link to="/register">{t("login_register")}</Link>
                    </div>

                </Form>
            </Card>
        </div>
    );
}
