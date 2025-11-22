import { Avatar, Badge, Card, Group, Stack, Text, Title, Box } from '@mantine/core';
import { Target, User } from 'lucide-react';
import type { UserSuggestionDto } from '../../types/StartupType';

interface CartMemberProps {
    member: UserSuggestionDto;
    swipeDirection?: 'left' | 'right' | null;
}

export default function CartMember({ member, swipeDirection }: CartMemberProps) {
    const getMatchScoreColor = (score: number) => {
        if (score >= 80) return 'green';
        if (score >= 60) return 'yellow';
        if (score >= 40) return 'orange';
        return 'red';
    };

    const parseSkills = (skills: string | null): string[] => {
        if (!skills) return [];
        try {
            return skills.split(',').map(s => s.trim()).filter(s => s);
        } catch {
            return [];
        }
    };

    const parseRoles = (roles: string | null): string[] => {
        if (!roles) return [];
        try {
            return roles.split(',').map(r => r.trim()).filter(r => r);
        } catch {
            return [];
        }
    };

    const parseCategories = (categories: string | null): string[] => {
        if (!categories) return [];
        try {
            return categories.split(',').map(c => c.trim()).filter(c => c);
        } catch {
            return [];
        }
    };

    return (
        <Card
            shadow="xl"
            padding={0}
            radius="lg"
            withBorder
            w="100%"
            maw={450}
            style={{
                transition: 'all 0.3s',
                transform: swipeDirection === 'left' 
                    ? 'translateX(-100%)' 
                    : swipeDirection === 'right' 
                    ? 'translateX(100%)' 
                    : 'translateX(0)',
                opacity: swipeDirection ? 0 : 1,
                overflow: 'hidden',
                position: 'relative'
            }}
        >
            {/* Match Score Badge - Top Right */}
            <Badge
                size="lg"
                radius="md"
                color={getMatchScoreColor(member.matchScore)}
                leftSection={<Target size={16} />}
                style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    zIndex: 10,
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
            >
                {member.matchScore.toFixed(1)}% Match
            </Badge>

            {/* Background behind avatar - top half */}
            <Box
                style={{
                    background: 'linear-gradient(135deg, #f2dc1d 0%, #e6c91a 100%)',
                    height: '100px',
                    width: '100%',
                    position: 'absolute',
                }}
            />
            <div className='min-h-[50px]'></div>

            <Stack gap="md" px="xl"  style={{ minHeight: '550px' }}>
                {/* Avatar */}
                <Box pos="relative" style={{ alignSelf: 'flex-start' }}>
                    <Avatar
                        src={member.avatar}
                        size={100}
                        radius="xl"
                        alt={member.fullName}
                        pos="relative"
                        style={{
                            borderRadius: '50%',
                            border: '4px solid white',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            backgroundColor: '#f2dc1d'
                        }}
                    >
                        <User size={50} color="white" />
                    </Avatar>
                </Box>

                {/* Name */}
                <Title order={3} style={{ marginTop: '-8px' }}>{member.fullName}</Title>

                {/* Bio */}
                {member.bio && (
                    <Text size="sm" c="dimmed" lineClamp={3} lh={1.6}>
                        {member.bio}
                    </Text>
                )}

                {/* Skills */}
                {member.skills && parseSkills(member.skills).length > 0 && (
                    <Stack gap={8} w="100%">
                        <Text size="sm" fw={600} c="dimmed" >Kỹ năng</Text>
                        <Group gap={8}>
                            {parseSkills(member.skills).slice(0, 6).map((skill, index) => (
                                <Badge
                                    key={index}
                                    variant="light"
                                    color="blue"
                                    size="lg"
                                    radius="md"
                                    style={{ textTransform: 'none' }}
                                >
                                    {skill}
                                </Badge>
                            ))}
                        </Group>
                    </Stack>
                )}

                {/* Roles */}
                {member.rolesInStartup && parseRoles(member.rolesInStartup).length > 0 && (
                    <Stack gap={8} w="100%">
                        <Text size="sm" fw={600} c="dimmed">Vai trò mong muốn</Text>
                        <Group gap={8}>
                            {parseRoles(member.rolesInStartup).map((role, index) => (
                                <Badge
                                    key={index}
                                    variant="light"
                                    color="grape"
                                    size="lg"
                                    radius="md"
                                    style={{ textTransform: 'none' }}
                                >
                                    {role}
                                </Badge>
                            ))}
                        </Group>
                    </Stack>
                )}

                {/* Category Invests */}
                {member.categoryInvests && parseCategories(member.categoryInvests).length > 0 && (
                    <Stack gap={8} w="100%">
                        <Text size="sm" fw={600} c="dimmed">Lĩnh vực đầu tư</Text>
                        <Group gap={8}>
                            {parseCategories(member.categoryInvests).map((category, index) => (
                                <Badge
                                    key={index}
                                    variant="light"
                                    color="teal"
                                    size="lg"
                                    radius="md"
                                    style={{ textTransform: 'none' }}
                                >
                                    {category}
                                </Badge>
                            ))}
                        </Group>
                    </Stack>
                )}
            </Stack>
        </Card>
    );
}
