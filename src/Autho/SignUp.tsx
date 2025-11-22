// import { useState } from 'react';
import {
  Button,
  Checkbox,
  Divider,
  Group,
  MultiSelect,
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
import showErrorNotification from '../Toast/NotificationError';
import showSuccessNotification from '../Toast/NotificationSuccess';
import type { RegisterRequest } from '../types/UserType';
import { validateAgreeTerms, validateConfirmPassword, validateEmail, validatePassword } from '../untils/ValidateInput';

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

const SKILLS_OPTIONS = [
  { value: 'react', label: 'React' },
  { value: 'nodejs', label: 'Node.js' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'uiux', label: 'UI/UX Design' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'business', label: 'Business Development' },
  { value: 'finance', label: 'Finance' },
  { value: 'product', label: 'Product Management' },
];

const ROLES_OPTIONS = [
  { value: 'founder', label: 'Founder/Co-founder' },
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'Designer' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'product_manager', label: 'Product Manager' },
  { value: 'business_analyst', label: 'Business Analyst' },
  { value: 'investor', label: 'Investor' },
];

const CATEGORY_OPTIONS = [
  { value: 'fintech', label: 'Fintech' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'healthtech', label: 'Healthtech' },
  { value: 'edtech', label: 'Edtech' },
  { value: 'saas', label: 'SaaS' },
  { value: 'ai', label: 'AI/ML' },
  { value: 'blockchain', label: 'Blockchain' },
  { value: 'iot', label: 'IoT' },
  { value: 'greentech', label: 'Green Tech' },
  { value: 'social', label: 'Social Network' },
];

export function SignUp() {
  const [isLoading, setIsLoading] = useState(false);
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
      fullName: (value) => (value ? null : 'Họ tên là bắt buộc'),
      email: (value) => validateEmail(value),
      password: (value) => validatePassword(value),
      confirmPassword: (value, values) => validateConfirmPassword(values.password, value),
      skills: (value) => (value.length > 0 ? null : 'Vui lòng chọn ít nhất 1 kỹ năng'),
      rolesInStartup: (value) => (value.length > 0 ? null : 'Vui lòng chọn ít nhất 1 vai trò'),
      categoryInvests: (value) => (value.length > 0 ? null : 'Vui lòng chọn ít nhất 1 lĩnh vực'),
      agreeTerms: (value) => validateAgreeTerms(value),
    },
  });

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
        showSuccessNotification(
          'Đăng ký thành công!',
          'Đăng nhập để trải nghiệm nhé.'
        );

  
        // Navigate to login or home page
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
      className="w-1/2 bg-white flex items-center justify-center p-8 overflow-y-auto"
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
        <Title order={1} className="text-3xl font-bold mb-6 text-center text-slate-800">
          Đăng ký
        </Title>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Họ và tên"
              placeholder="Nhập tên đây nha thượng đế"
              required
              {...form.getInputProps('fullName')}
              size="md"
            />

            <TextInput
              label="Email"
              placeholder="email nè"
              required
              {...form.getInputProps('email')}
              size="md"
            />

            <PasswordInput
              label="Mật khẩu"
              placeholder="Ngày sinh người yêu cũ ha -.-"
              required
              {...form.getInputProps('password')}
              size="md"
            />

            <PasswordInput
              label="Xác nhận mật khẩu"
              placeholder="Nhập lại mật khẩu của bạn"
              required
              {...form.getInputProps('confirmPassword')}
              size="md"
            />

            <MultiSelect
              label="Kỹ năng"
              placeholder="Chọn kỹ năng của bạn"
              data={SKILLS_OPTIONS}
              searchable
              required
              {...form.getInputProps('skills')}
              size="md"
              maxDropdownHeight={200}
            />

            <MultiSelect
              label="Vai trò trong Startup"
              placeholder="Bạn quan tâm đến vai trò nào?"
              data={ROLES_OPTIONS}
              searchable
              required
              {...form.getInputProps('rolesInStartup')}
              size="md"
              maxDropdownHeight={200}
            />

            <MultiSelect
              label="Lĩnh vực quan tâm"
              placeholder="Chọn lĩnh vực đầu tư/làm việc"
              data={CATEGORY_OPTIONS}
              searchable
              required
              {...form.getInputProps('categoryInvests')}
              size="md"
              maxDropdownHeight={200}
            />

            <Checkbox
              label="Tôi đồng ý với điều khoản sử dụng và chính sách bảo mật"
              {...form.getInputProps('agreeTerms', { type: 'checkbox' })}
            />

            <Button
              fullWidth
              type="submit"
              loading={isLoading}
              size="md"
              disabled={isLoading || !form.values.agreeTerms}
            >
              Đăng ký
            </Button>
          </Stack>
        </form>

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