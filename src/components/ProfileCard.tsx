import { Avatar, Button, Card, Divider, Group, Stack, Text } from '@mantine/core';
import { Briefcase, Calendar, Facebook, Github, Instagram, Link2, Linkedin, Mail, MapPin, Twitter } from 'lucide-react';
import type { ProfileData } from '../types/profile.types';

interface ProfileCardProps {
    profileData: ProfileData;
    onEditClick: () => void;
    email?: string;
    username?: string;
    joinDate?: string;
    occupation?: string;
    website?: string;
    ideasCount?: number;
    followingCount?: number;
    followersCount?: number;
    showEditButton?: boolean;
    socialLinks?: {
        facebook?: string;
        twitter?: string;
        linkedin?: string;
        github?: string;
        instagram?: string;
    };
}

export default function ProfileCard({
    profileData,
    onEditClick,
    email = 'email@example.com',
    username = 'username',
    joinDate = 'Tham gia tháng 1, 2024',
    occupation = 'Developer',
    website = 'website.com',
    ideasCount = 0,
    followingCount = 0,
    followersCount = 0,
    showEditButton = true,
    socialLinks
}: ProfileCardProps) {
    return (
        <Card shadow="sm" padding="lg" radius="md" >
            <Stack gap="lg">
                {/* Profile Header */}
                <Stack align="center" gap="sm">
                    <Avatar
                        src={profileData.avatar}
                        size={96}
                        radius="xl"
                    />
                    <div className="text-center">
                        <Text size="xl" fw={700}>{profileData.fullName}</Text>
                        <Text size="sm" c="dimmed">@{username}</Text>
                    </div>

                    {showEditButton && (
                        <Button
                            onClick={onEditClick}
                            color="yellow"
                            fullWidth
                        >
                            Chỉnh sửa hồ sơ
                        </Button>
                    )}

                    {/* Social Media Links */}
                    {socialLinks && (
                        <Group gap="xs" justify="center">
                            {socialLinks.facebook && (
                                <a
                                    href={socialLinks.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-full hover:bg-blue-50 transition-colors"
                                >
                                    <Facebook size={20} className="text-blue-600" />
                                </a>
                            )}
                            {socialLinks.twitter && (
                                <a
                                    href={socialLinks.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-full hover:bg-sky-50 transition-colors"
                                >
                                    <Twitter size={20} className="text-sky-500" />
                                </a>
                            )}
                            {socialLinks.linkedin && (
                                <a
                                    href={socialLinks.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-full hover:bg-blue-50 transition-colors"
                                >
                                    <Linkedin size={20} className="text-blue-700" />
                                </a>
                            )}
                            {socialLinks.github && (
                                <a
                                    href={socialLinks.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-full hover:bg-gray-50 transition-colors"
                                >
                                    <Github size={20} className="text-gray-800" />
                                </a>
                            )}
                            {socialLinks.instagram && (
                                <a
                                    href={socialLinks.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-full hover:bg-pink-50 transition-colors"
                                >
                                    <Instagram size={20} className="text-pink-600" />
                                </a>
                            )}
                        </Group>
                    )}
                </Stack>

                <Divider />

                {/* Stats */}
                <Group justify="space-around" grow>
                    <Stack align="center" gap={0}>
                        <Text size="lg" fw={700}>{ideasCount}</Text>
                        <Text size="xs" c="dimmed">Ý tưởng</Text>
                    </Stack>
                    <Stack align="center" gap={0}>
                        <Text size="lg" fw={700}>{followingCount}</Text>
                        <Text size="xs" c="dimmed">Theo dõi</Text>
                    </Stack>
                    <Stack align="center" gap={0}>
                        <Text size="lg" fw={700}>{followersCount}</Text>
                        <Text size="xs" c="dimmed">Người theo dõi</Text>
                    </Stack>
                </Group>

                <Divider />

                {/* Profile Details */}
                <Stack gap="md">
                    <Group gap="sm">
                        <Mail size={16} className="text-gray-600" />
                        <Text size="sm" c="dimmed">{email}</Text>
                    </Group>

                    <Group gap="sm">
                        <Calendar size={16} className="text-gray-600" />
                        <Text size="sm" c="dimmed">{joinDate}</Text>
                    </Group>

                    {profileData.location && (
                        <Group gap="sm">
                            <MapPin size={16} className="text-gray-600" />
                            <Text size="sm" c="dimmed">{profileData.location}</Text>
                        </Group>
                    )}

                    <Group gap="sm">
                        <Briefcase size={16} className="text-gray-600" />
                        <Text size="sm" c="dimmed">{occupation}</Text>
                    </Group>

                    <Group gap="sm">
                        <Link2 size={16} className="text-gray-600" />
                        <Text size="sm" c="blue">{website}</Text>
                    </Group>
                </Stack>
            </Stack>
        </Card>
    );
}
