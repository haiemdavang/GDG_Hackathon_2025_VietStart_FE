import { Checkbox, MultiSelect, Stack } from '@mantine/core';
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

interface SignUpStep2Props {
  form: UseFormReturnType<SignUpFormValues>;
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

export function SignUpStep2({ form }: SignUpStep2Props) {
  return (
    <Stack gap="md" mt="md">
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
    </Stack>
  );
}
