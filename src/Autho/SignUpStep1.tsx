import { PasswordInput, Stack, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

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

interface SignUpStep1Props {
  form: UseFormReturnType<SignUpFormValues>;
}

export function SignUpStep1({ form }: SignUpStep1Props) {
  return (
    <Stack gap="md" mt="md">
      <TextInput
        label="Họ và tên"
        placeholder="Nhập tên của bạn"
        required
        {...form.getInputProps('fullName')}
        size="md"
      />

      <TextInput
        label="Email"
        placeholder="Nhập email của bạn"
        required
        {...form.getInputProps('email')}
        size="md"
      />

      <PasswordInput
        label="Mật khẩu"
        placeholder="Nhập mật khẩu của bạn"
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
    </Stack>
  );
}
