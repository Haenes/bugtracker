import { Card, Button, Input } from 'antd';

import { Form, Link, useNavigation } from "react-router";

import { useTranslation } from "react-i18next";


export function ForgotPasswordForm() {
    const { t } = useTranslation();
    const navigation = useNavigation();

    return (
        <div className="flex flex-col h-screen w-screen items-center justify-center">
            <Card title={t("forgotPassword_title")} className="text-center">

                <Form method="post" name="forgotPassword" className="flex flex-col">
                    <span className="text-start text-stone-400">
                        {t("forgotPassword_span")}
                    </span>

                    <Input
                        name="email"
                        size="large"
                        autoComplete="email"
                        type="email"
                        placeholder={t("email")}
                        autoFocus
                        required
                    />

                    <Button loading={navigation.state === "submitting" & 50} className="my-4" type="primary" htmlType="submit">
                        {t("forgotPassword_btn")}    
                    </Button>

                    <Link to="/login">{t("returnToLogin")}</Link>
                </Form>

            </Card>
        </div>
    );
}
