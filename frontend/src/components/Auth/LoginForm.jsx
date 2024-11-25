import { useState } from 'react';

import { LockOutlined, UserOutlined } from '@ant-design/icons';

import { Card, Button, Checkbox, Input } from 'antd';

import { Form, Link, useActionData } from "react-router";


export function LoginForm({ children }) {
    return (
        <div className="flex flex-col h-screen w-screen items-center justify-center">
            <div className="mb-5">{children}</div>

            <Card title="Log in">
                <LoginFormHelper/>
            </Card>
        </div>
    );
}


/**
 * A function that helps reduce nesting in the LoginForm
 * @returns {Form}
 */
function LoginFormHelper() {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const errors = useActionData();

    return (
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
                placeholder="Email"
                autoFocus
                required
                prefix={<UserOutlined />}
            />

            <Input.Password
                name="password"
                autoComplete="current-password"
                status={errors?.auth && "error"}
                type="password"
                placeholder="Password"
                minLength={6}
                required
                prefix={<LockOutlined />}
                visibilityToggle={() => (!setPasswordVisible)}
            />

            <Checkbox name="remember">Remember me</Checkbox>

            <Button block type="primary" htmlType="submit">
                Log in
            </Button>

            <div className="flex flex-row gap-x-10">
                <Link to="/forgot-pasword">Forgot password</Link>
                <Link to="/register">Register now!</Link>
            </div>

        </Form>
    );
}
