// import { useState } from 'react';
import {
  Button,
  Divider,
  Group,
  Stepper,
  Text,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { FaFacebook, FaGoogle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../service/AuthService';
import showErrorNotification from '../Toast/NotificationError';
import showSuccessNotification from '../Toast/NotificationSuccess';
import type { RegisterRequest } from '../types/UserType';
import { validateAgreeTerms, validateConfirmPassword, validateEmail, validatePassword } from '../untils/ValidateInput';
import { SignUpStep1 } from './SignUpStep1';
import { SignUpStep2 } from './SignUpStep2';

interface SignUpFormValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  skills: string[];
  rolesInStartup: string[];
  categoryInvests: string[];
  agreeTerms: boolean;
}

export function SignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const [active, setActive] = useState(0);
  const navigate = useNavigate();

  const form = useForm<SignUpFormValues>({
    initialValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      skills: [],
      rolesInStartup: [],
      categoryInvests: [],
      agreeTerms: false,
    },
    validate: {
      fullName: (value) => (active === 0 && value ? null : active === 0 ? 'Họ tên là bắt buộc' : null),
      email: (value) => (active === 0 ? validateEmail(value) : null),
      password: (value) => (active === 0 ? validatePassword(value) : null),
      confirmPassword: (value, values) => (active === 0 ? validateConfirmPassword(values.password, value) : null),
      skills: (value) => (active === 1 && value.length > 0 ? null : active === 1 ? 'Vui lòng chọn ít nhất 1 kỹ năng' : null),
      rolesInStartup: (value) => (active === 1 && value.length > 0 ? null : active === 1 ? 'Vui lòng chọn ít nhất 1 vai trò' : null),
      categoryInvests: (value) => (active === 1 && value.length > 0 ? null : active === 1 ? 'Vui lòng chọn ít nhất 1 lĩnh vực' : null),
      agreeTerms: (value) => (active === 1 ? validateAgreeTerms(value) : null),
    },
  });

  const nextStep = () => {
    const validation = form.validate();
    if (!validation.hasErrors) {
      setActive((current) => (current < 1 ? current + 1 : current));
    }
  };

  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const handleSubmit = async (values: SignUpFormValues) => {
    const registerData: RegisterRequest = {
      fullName: values.fullName,
      email: values.email,
      password: values.password,
      confirmPassword: values.confirmPassword,
      skills: values.skills.join(','),
      rolesInStartup: values.rolesInStartup.join(','),
      categoryInvests: values.categoryInvests.join(','),
    };

    setIsLoading(true);
    try {
      const response = await AuthService.register(registerData);

      if (response.status === 200 || response.status === 201) {
        showSuccessNotification('Đăng ký thành công!', 'Đăng nhập để trải nghiệm nhé.');

        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Registration error:', error);

      const errorMessage = error.response?.data?.message
        || error.response?.data?.errors?.[0]
        || 'Đã có lỗi xảy ra. Vui lòng thử lại!';

      showErrorNotification('Đăng ký thất bại', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    showErrorNotification('Chức năng đang phát triển', 'Đăng ký bằng Google sẽ sớm được ra mắt!');
  };

  return (
    <motion.div
      className="w-full md:w-1/2 bg-white flex items-center justify-center p-8 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-full max-w-md py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Title order={1} className="text-2xl md:text-3xl font-bold !mb-5 md:!mb-6 text-center text-slate-800">
          Đăng ký
        </Title>

        <Stepper active={active} onStepClick={setActive} mb="xl" size="xs" className="md:text-base">
          <Stepper.Step label="Bước 1" description="Thông tin tài khoản" className="text-xs md:text-sm">
            <SignUpStep1 form={form} />
          </Stepper.Step>

          <Stepper.Step label="Bước 2" description="Thông tin cá nhân" className="text-xs md:text-sm">
            <SignUpStep2 form={form} />
          </Stepper.Step>
        </Stepper>

        <Group justify="space-between" mt="xl">
          {active > 0 && (
            <Button variant="default" onClick={prevStep}>
              Quay lại
            </Button>
          )}
          {active === 0 && (
            <Button onClick={nextStep} style={{ marginLeft: 'auto' }}>
              Tiếp theo
            </Button>
          )}
          {active === 1 && (
            <Button
              onClick={() => form.onSubmit(handleSubmit)()}
              loading={isLoading}
              disabled={isLoading || !form.values.agreeTerms}
            >
              Đăng ký
            </Button>
          )}
        </Group>

        {active === 0 && (
          <>
            <Divider label="Hoặc đăng ký với" labelPosition="center" my="lg" />

            <Group grow>
              <Button
                leftSection={<FaGoogle size={16} />}
                variant="outline"
                className="border-gray-300"
                onClick={handleGoogleLogin}
              >
                Google
              </Button>
              <Button
                leftSection={<FaFacebook size={16} />}
                variant="outline"
                className="border-gray-300"
                onClick={() => showSuccessNotification('Chức năng đang phát triển', 'Đăng ký bằng Facebook sẽ sớm được ra mắt!')}
              >
                Facebook
              </Button>
            </Group>
          </>
        )}

        <Text className="text-center text-gray-600 mt-4">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Đăng nhập
          </Link>
        </Text>
      </motion.div>
    </motion.div>
  );
}