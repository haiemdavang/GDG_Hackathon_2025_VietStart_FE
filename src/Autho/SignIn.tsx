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
import AuthService from '../service/AuthService';
import UserService from '../service/UserService';
import { setCredentials } from '../store/authSlice';
import { useAppDispatch } from '../store/hooks';
import showErrorNotification from '../Toast/NotificationError';
import showSuccessNotification from '../Toast/NotificationSuccess';
import { getUserIdFromToken } from '../untils/Helper';
import { validateEmail, validatePassword } from '../untils/ValidateInput';

interface SignInFormValues {
  email: string;
  password: string;
}

export function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const form = useForm<SignInFormValues>({
    initialValues: {
      email: 'khanh1512@gmail.com',
      password: 'Khanh12345@',
    },
    validate: {
      email: (value) => validateEmail(value),
      password: (value) => validatePassword(value),
    },
  });

  const handleSubmit = async (values: SignInFormValues) => {
    form.clearErrors();
    setIsLoading(true);

    try {
      const response = await AuthService.login(values.email, values.password);

      if (response.status === 200) {
        const { access_token } = response.data;

        // Get user ID from token
        const userId = getUserIdFromToken(access_token);
        if (userId) {
          // Fetch user profile
          const userResponse = await UserService.getUserProfile(userId);

          if (userResponse.status === 200) {
            // Update Redux store
            dispatch(setCredentials(userResponse.data));

            showSuccessNotification(
              'Đăng nhập thành công!',
              'Chào mừng bạn quay trở lại.'
            );

            // Navigate to home page
            setTimeout(() => {
              navigate('/');
            }, 1000);
          }
        } else {
          throw new Error('Không thể xác thực người dùng');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);

      let errorMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại!';

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 400) {
          errorMessage = data?.message || data?.title || 'Thông tin đăng nhập không hợp lệ';
        } else if (status === 401) {
          errorMessage = 'Email hoặc mật khẩu không đúng';
        } else if (status === 403) {
          errorMessage = 'Tài khoản chưa được xác thực email';
        } else if (data?.message) {
          errorMessage = data.message;
        } else if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          errorMessage = data.errors[0];
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      showErrorNotification('Đăng nhập thất bại', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    showErrorNotification('Chức năng đang phát triển', 'Đăng nhập bằng Google sẽ sớm được ra mắt!');
  };


  return (
    <motion.div
      className="w-full md:w-1/2 bg-white flex items-center justify-center p-8"
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