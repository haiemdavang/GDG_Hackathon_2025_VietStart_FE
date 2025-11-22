import { Avatar, Button, FileButton, Group, Modal, Stack, TextInput, Textarea } from '@mantine/core';
import { Camera, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import UserService from '../service/UserService';
import showErrorNotification from '../Toast/NotificationError';
import type { ProfileData } from '../types/profile.types';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ProfileData) => void;
    initialData?: ProfileData;
}

export default function EditProfileModal({ isOpen, onClose, onSave, initialData }: EditProfileModalProps) {
   

    return (
        <Modal
            opened={isOpen}
            onClose={onClose}
            title="Chỉnh sửa hồ sơ"
            size="lg"
            centered
            styles={{
                title: {
                    fontSize: '1.5rem',
                    fontWeight: 700,
                },
            }}
        >
            <form onSubmit={handleSubmit}>
                <Stack gap="lg">
                    {/* Avatar and Name Section */}
                    <Group gap="xl" align="flex-start">
                        {/* Avatar with Upload */}
                        <div style={{ position: 'relative' }}>
                            <Avatar
                                src={formData.avatar}
                                size={120}
                                radius="xl"
                            >
                                <Upload size={40} />
                            </Avatar>
                            <FileButton
                                onChange={handleFileChange}
                                accept="image/png,image/jpeg,image/jpg"
                                disabled={isUploading}
                            >
                                {(props) => (
                                    <Button
                                        {...props}
                                        size="xs"
                                        radius="xl"
                                        color="yellow"
                                        loading={isUploading}
                                        style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            right: 0,
                                        }}
                                        leftSection={<Camera size={16} />}
                                    >
                                        {isUploading ? 'Đang tải...' : 'Thay đổi'}
                                    </Button>
                                )}
                            </FileButton>
                        </div>

                        {/* Name Input */}
                        <div style={{ flex: 1 }}>
                            <TextInput
                                label="Họ và tên"
                                placeholder="Nhập họ và tên"
                                value={formData.fullName}
                                onChange={(e) => handleChange('fullName')(e.currentTarget.value)}
                                required
                                withAsterisk
                                size="md"
                            />
                        </div>
                    </Group>

                    {/* Date of Birth */}
                    <TextInput
                        label="Ngày sinh"
                        type="date"
                        value={formData.dob}
                        onChange={(e) => handleChange('dob')(e.currentTarget.value)}
                    />

                    {/* Location */}
                    <TextInput
                        label="Địa điểm"
                        placeholder="Thành phố, Quốc gia"
                        value={formData.location}
                        onChange={(e) => handleChange('location')(e.currentTarget.value)}
                    />

                    {/* Bio */}
                    <Textarea
                        label="Giới thiệu"
                        placeholder="Viết một vài dòng về bản thân..."
                        value={formData.bio}
                        onChange={(e) => handleChange('bio')(e.currentTarget.value)}
                        rows={4}
                        autosize
                        minRows={4}
                        maxRows={6}
                    />

                    {/* Buttons */}
                    <Group justify="flex-end" mt="md">
                        <Button
                            variant="default"
                            onClick={onClose}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            color="yellow"
                        >
                            Lưu thay đổi
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
