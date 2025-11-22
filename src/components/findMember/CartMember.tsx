import { Avatar, Badge, Card, Group, Stack, Text, Title, Box } from '@mantine/core';
import { motion, AnimatePresence } from 'framer-motion';
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

    const cardVariants = {
        enter: (direction: 'left' | 'right' | null) => ({
            x: direction === 'left' ? -100 : direction === 'right' ? 100 : 0,
            opacity: 0,
            scale: 0.8,
            rotateY: direction === 'left' ? -20 : direction === 'right' ? 20 : 0,
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
            rotateY: 0,
        },
        exit: (direction: 'left' | 'right' | null) => ({
            x: direction === 'left' ? -300 : direction === 'right' ? 300 : 0,
            opacity: 0,
            scale: 0.8,
            rotateY: direction === 'left' ? -30 : direction === 'right' ? 30 : 0,
        })
    };

    return (
        <motion.div
            custom={swipeDirection}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1],
            }}
            style={{ width: '100%', maxWidth: '450px' }}
        >
            <Card
                shadow="xl"
                padding={0}
                radius="lg"
                withBorder
                w="100%"
                style={{
                    overflow: 'hidden',
                    position: 'relative'
                }}
            >
                {/* Match Score Badge - Top Right */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                >
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
                </motion.div>

                {/* Background behind avatar - top half */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.4 }}
                    style={{ transformOrigin: 'left' }}
                >
                    <Box
                        style={{
                            background: 'linear-gradient(135deg, #f2dc1d 0%, #e6c91a 100%)',
                            height: '100px',
                            width: '100%',
                            position: 'absolute',
                        }}
                    />
                </motion.div>
                <div className='min-h-[50px]'></div>

                <Stack gap="md" px="xl" style={{ minHeight: '550px' }}>
                    {/* Avatar */}
                    <motion.div
                        initial={{ scale: 0, y: -50 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    >
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
                    </motion.div>

                    {/* Name */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Title order={3} style={{ marginTop: '-8px' }}>{member.fullName}</Title>
                    </motion.div>

                    {/* Bio */}
                    {member.bio && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Text size="sm" c="dimmed" lineClamp={3} lh={1.6}>
                                {member.bio}
                            </Text>
                        </motion.div>
                    )}

                    {/* Skills */}
                    {member.skills && parseSkills(member.skills).length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Stack gap={8} w="100%">
                                <Text size="sm" fw={600} c="dimmed" >Kỹ năng</Text>
                                <Group gap={8}>
                                    {parseSkills(member.skills).slice(0, 6).map((skill, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.5 + index * 0.05 }}
                                        >
                                            <Badge
                                                variant="light"
                                                color="blue"
                                                size="lg"
                                                radius="md"
                                                style={{ textTransform: 'none' }}
                                            >
                                                {skill}
                                            </Badge>
                                        </motion.div>
                                    ))}
                                </Group>
                            </Stack>
                        </motion.div>
                    )}

                    {/* Roles */}
                    {member.rolesInStartup && parseRoles(member.rolesInStartup).length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <Stack gap={8} w="100%">
                                <Text size="sm" fw={600} c="dimmed">Vai trò mong muốn</Text>
                                <Group gap={8}>
                                    {parseRoles(member.rolesInStartup).map((role, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.6 + index * 0.05 }}
                                        >
                                            <Badge
                                                variant="light"
                                                color="grape"
                                                size="lg"
                                                radius="md"
                                                style={{ textTransform: 'none' }}
                                            >
                                                {role}
                                            </Badge>
                                        </motion.div>
                                    ))}
                                </Group>
                            </Stack>
                        </motion.div>
                    )}

                    {/* Category Invests */}
                    {member.categoryInvests && parseCategories(member.categoryInvests).length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                        >
                            <Stack gap={8} w="100%">
                                <Text size="sm" fw={600} c="dimmed">Lĩnh vực đầu tư</Text>
                                <Group gap={8}>
                                    {parseCategories(member.categoryInvests).map((category, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.7 + index * 0.05 }}
                                        >
                                            <Badge
                                                variant="light"
                                                color="teal"
                                                size="lg"
                                                radius="md"
                                                style={{ textTransform: 'none' }}
                                            >
                                                {category}
                                            </Badge>
                                        </motion.div>
                                    ))}
                                </Group>
                            </Stack>
                        </motion.div>
                    )}
                </Stack>
            </Card>
        </motion.div>
    );
}
