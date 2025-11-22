import {
  Anchor,
  Button,
  Divider,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { FaFacebook, FaGoogle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

interface SignInFormValues {
  email: string;
  password: string;
}

export function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<SignInFormValues>({
    initialValues: {
      email: 'user@example.com',
      password: 'Abc123!@#',
    },
    
  });

  const handleSubmit = async (values: SignInFormValues) => {
    form.clearErrors();
    setIsLoading(true);

  
  };

  const handleGoogleLogin = () => {
    showErrorNotification('Chức năng đang phát triển', 'Đăng nhập bằng Google sẽ sớm được ra mắt!');
  };


  return (
    <motion.div
      className="w-1/2 bg-white flex items-center justify-center p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Title order={1} className="text-3xl font-bold mb-6 text-center text-slate-800">
          Đăng nhập
        </Title>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Email"
              placeholder="your@email.com"
              required
              {...form.getInputProps('email')}
              size="md"
              disabled={isLoading}
            />

            <PasswordInput
              label="Mật khẩu"
              placeholder="Mật khẩu của bạn"
              required
              {...form.getInputProps('password')}
              size="md"
              disabled={isLoading}
            />

            <Group justify="apart">
              <Anchor
                size="sm"
                component="button"
                type="button"
                className="text-primary"
                onClick={() => showErrorNotification('Chức năng đang phát triển', 'Quên mật khẩu sẽ sớm được ra mắt!')}
              >
                Quên mật khẩu?
              </Anchor>
            </Group>

            <Button
              fullWidth
              type="submit"
              loading={isLoading}
              className="bg-primary hover:bg-primary/90 mt-4"
              size="md"
              disabled={isLoading}
            >
              Đăng nhập
            </Button>
          </Stack>
        </form>

        <Divider label="Hoặc đăng nhập với" labelPosition="center" my="lg" />

        <Group grow>
          <Button
            leftSection={<FaGoogle size={16} />}
            variant="outline"
            className="border-gray-300"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            Google
          </Button>
          <Button
            leftSection={<FaFacebook size={16} />}
            variant="outline"
            className="border-gray-300"
            onClick={() => showErrorNotification('Chức năng đang phát triển', 'Đăng ký bằng Facebook sẽ sớm được ra mắt!')}
            disabled={isLoading}
          >
            Facebook
          </Button>
        </Group>

        <Text className="!mt-6 block text-center !text-gray-600">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Đăng ký ngay
          </Link>
        </Text>
      </motion.div>
    </motion.div>
  );
}