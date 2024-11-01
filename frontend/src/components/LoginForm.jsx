import { LockOutlined, UserOutlined } from '@ant-design/icons';
import {
    Col,
    Row,
    Card,
    Button,
    Checkbox,
    Form,
    Input
} from 'antd';


export function LoginForm() {
    const onFinish = (values) => {
        console.log('Received values of form: ', values);
    };

    return (
        <Row className='h-screen w-screen items-center justify-center'>
            <Col>
                <Card title="Log in">
                    <Form
                        name="login"
                        initialValues={{remember: false}}
                        style={{maxWidth: 360}}
                        onFinish={onFinish}
                    >
                        <Form.Item
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your email!',
                                },
                            ]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="Email" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your password!',
                                },
                            ]}
                        >
                            <Input prefix={<LockOutlined />} type="password" placeholder="Password" />
                        </Form.Item>

                        <Form.Item>
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox>Remember me</Checkbox>
                            </Form.Item>
                        </Form.Item>

                        <Form.Item>
                            <Button block type="primary" htmlType="submit">
                                Log in
                            </Button>

                            <div className='flex flex-row gap-10 pt-2'>
                                <a href="login/1">Forgot password</a>
                                <a href="register">Register now!</a>
                            </div>
                        </Form.Item>
                    </Form>
                </Card>
            </Col>
        </Row>
    );
}
