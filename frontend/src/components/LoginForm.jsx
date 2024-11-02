import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useState } from 'react';
import {
    Col,
    Row,
    Card,
    Button,
    Checkbox,
    Input
} from 'antd';

import { Form as RouterForm, useActionData } from "react-router-dom";


export function LoginForm() {
    return (
        <Row className='h-screen w-screen items-center justify-center'>
            <Col>
                <Card title="Log in">
                    <LoginFormHelper />
                </Card>
            </Col>
        </Row>
    );
}


/**
 * A function that helps reduce nesting in the LoginForm
 * @returns {RouterForm}
 */
function LoginFormHelper() {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const errors = useActionData();

    return (
        <RouterForm  method="post" name="login" className="flex flex-col gap-y-4">

            <div className='text-center text-red-500'>
                {errors?.auth && <span>{errors.auth}</span>}
            </div>

            <Input
                name="username"
                status={errors?.auth && "error"}
                type="email"
                placeholder="Email"
                autoFocus
                required
                prefix={<UserOutlined />}
            />

            <Input.Password
                name="password"
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

            <div className='flex flex-row gap-x-10'>
                <a href="login/1">Forgot password</a>
                <a href="register">Register now!</a>
            </div>

        </RouterForm>
    )
}
