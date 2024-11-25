import { Card, Button, Input } from 'antd';

import { Form, Link } from "react-router";


export function ForgotPasswordForm() {
    return (
        <div className="flex flex-col h-screen w-screen items-center justify-center">
            <Card title="Can't log in?" className="text-center">

                <Form method="post" name="forgotPassword" className="flex flex-col">
                    <span className="text-start text-stone-400">
                        We'll send a recovery link to:
                    </span>

                    <Input
                        name="email"
                        size="large"
                        autoComplete="email"
                        type="email"
                        placeholder="Email"
                        autoFocus
                        required
                    />

                    <Button className="my-4" type="primary" htmlType="submit">
                        Send    
                    </Button>

                    <Link to="/login">Return to log in</Link>
                </Form>

            </Card>
        </div>
    );
}
