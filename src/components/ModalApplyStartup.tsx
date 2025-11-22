import { Button, FileInput, Select, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Briefcase, FileText, Mail, Phone, Upload, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import PositionService from '../service/PositionService';
import TeamStartupService from '../service/TeamStartupService';
import type { RootState } from '../store/store';
import showErrorNotification from '../Toast/NotificationError';
import showSuccessNotification from '../Toast/NotificationSuccess';
import { TEAM_STATUS } from '../types/StartupPositionType';

interface ApplyStartupModalProps {
    isOpen: boolean;
    onClose: () => void;
    startupId: number;
}

export interface ApplyStartupFormData {
    fullName: string;
    email: string;
    phone: string;
    role: string;
    experience: string;
    motivation: string;
    cv: File | null;
    portfolio?: string;
}


export default function ModalApplyStartup({
    isOpen,
    onClose,
    startupId,
}: ApplyStartupModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [positions, setPositions] = useState<Array<{ value: string; label: string }>>([]);
    const [isLoadingPositions, setIsLoadingPositions] = useState(false);
    const user = useSelector((state: RootState) => state.auth.user);


    const form = useForm<ApplyStartupFormData>({
        initialValues: {
            fullName: '',
            email: '',
            phone: '',
            role: '',
            experience: '',
            motivation: '',
            cv: null,
            portfolio: '',
        },
        validate: {
            fullName: (value) => (!value ? 'Vui lòng nhập họ tên' : null),
            email: (value) =>
                !value ? 'Vui lòng nhập email' :
                    !/^\S+@\S+$/.test(value) ? 'Email không hợp lệ' : null,
            phone: (value) =>
                !value ? 'Vui lòng nhập số điện thoại' :
                    !/^[0-9]{10}$/.test(value) ? 'Số điện thoại không hợp lệ' : null,
            role: (value) => (!value ? 'Vui lòng chọn vị trí ứng tuyển' : null),
            experience: (value) => (!value ? 'Vui lòng mô tả kinh nghiệm' : null),
            motivation: (value) => (!value ? 'Vui lòng mô tả động lực' : null),
            cv: (value) => (!value ? 'Vui lòng tải lên CV' : null),
        },
    });

    useEffect(() => {
        const fetchPositions = async () => {
            try {
                setIsLoadingPositions(true);
                const response = await PositionService.getPositions();
                const positionOptions = response.data.map(pos => ({
                    value: pos.id.toString(),
                    label: pos.name
                }));
                setPositions(positionOptions);
            } catch (error) {
                setPositions([]);
            } finally {
                setIsLoadingPositions(false);
            }
        };

        if (isOpen) {
            fetchPositions();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && user) {
            form.setValues({
                fullName: user.fullName || '',
                email: user.email || '',
                phone: user.phone || '',
                role: form.values.role,
                experience: form.values.experience,
                motivation: form.values.motivation,
                cv: form.values.cv,
                portfolio: user.website || '',
            });
        }
    }, [isOpen, user]);

    const handleSubmit = async (values: ApplyStartupFormData) => {
        if (!user?.id) {
            showErrorNotification(
                'Lỗi xác thực',
                'Vui lòng đăng nhập để ứng tuyển'
            );
            return;
        }
        try {
            setIsSubmitting(true);

            // Call TeamStartupService to create application
            await TeamStartupService.createTeamStartUp({
                startUpId: startupId,
                userId: user.id,
                positionId: parseInt(values.role),
                experience: values.experience,
                motivation: values.motivation,
                status: TEAM_STATUS.PENDING, 
            });

            showSuccessNotification(
                'Ứng tuyển thành công',
                'Đơn ứng tuyển của bạn đã được gửi. Chủ startup sẽ xem xét và phản hồi sớm!'
            );

            form.reset();
            onClose();

        } catch (error: any) {
            showErrorNotification(
                'Ứng tuyển thất bại',
                error.message || 'Không thể gửi đơn ứng tuyển. Vui lòng thử lại!'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        form.reset();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
            <div className="relative z-10 w-full max-w-3xl rounded-3xl bg-white shadow-2xl max-h-[90vh] flex flex-col">
                {/* Sticky Header */}
                <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-6 pt-4 pb-2 rounded-t-3xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">Ứng tuyển vào Startup</h2>
                        </div>
                        <button
                            onClick={handleClose}
                            className="rounded-full p-2 hover:bg-gray-100"
                            disabled={isSubmitting}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto px-6 pt-2 flex-1">
                    <form id="apply-form" onSubmit={form.onSubmit(handleSubmit)} className="space-y-4">
                        {/* Personal Information */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-sm text-gray-700">Thông tin cá nhân</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <TextInput
                                    label="Họ và tên"
                                    placeholder="Nguyễn Văn A"
                                    leftSection={<User size={16} />}
                                    required
                                    value={user?.fullName || ''}
                                    disabled
                                    className="bg-gray-50"
                                />

                                <TextInput
                                    label="Email"
                                    placeholder="example@email.com"
                                    type="email"
                                    leftSection={<Mail size={16} />}
                                    required
                                    value={user?.email || ''}
                                    disabled
                                    className="bg-gray-50"
                                />

                                <TextInput
                                    label="Số điện thoại"
                                    placeholder="0123456789"
                                    leftSection={<Phone size={16} />}
                                    required
                                    {...form.getInputProps('phone')}
                                />

                                <Select
                                    label="Vị trí ứng tuyển"
                                    placeholder="Chọn vị trí"
                                    leftSection={<Briefcase size={16} />}
                                    data={positions}
                                    required
                                    disabled={isLoadingPositions}
                                    {...form.getInputProps('role')}
                                />
                            </div>
                        </div>

                        {/* Application Details */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-sm text-gray-700">Thông tin ứng tuyển</h3>

                            <Textarea
                                label="Kinh nghiệm liên quan"
                                placeholder="Mô tả kinh nghiệm và kỹ năng của bạn..."
                                minRows={3}
                                required
                                {...form.getInputProps('experience')}
                            />

                            <Textarea
                                label="Động lực ứng tuyển"
                                placeholder="Tại sao bạn muốn tham gia startup này?"
                                minRows={3}
                                required
                                {...form.getInputProps('motivation')}
                            />
                        </div>

                        {/* Documents */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-sm text-gray-700">Tài liệu</h3>

                            <FileInput
                                label="CV/Resume"
                                placeholder="Tải lên CV của bạn"
                                leftSection={<Upload size={16} />}
                                accept=".pdf,.doc,.docx"
                                required
                                {...form.getInputProps('cv')}
                            />

                            <TextInput
                                label="Portfolio/LinkedIn (Tùy chọn)"
                                placeholder="https://linkedin.com/in/..."
                                leftSection={<FileText size={16} />}
                                {...form.getInputProps('portfolio')}
                            />
                        </div>
                    </form>
                </div>

                {/* Sticky Footer */}
                <div className="sticky bottom-0 z-20 bg-white border-t border-gray-100 px-6 py-4 rounded-b-3xl">
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="subtle"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            form="apply-form"
                            color="yellow"
                            loading={isSubmitting}
                        >
                            Gửi đơn ứng tuyển
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
