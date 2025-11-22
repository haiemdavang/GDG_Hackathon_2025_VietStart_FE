import { Badge, Button, Card, Collapse, Group, Stack, Text, Title } from '@mantine/core';
import { ChevronDown, Mail, MapPin } from 'lucide-react';
import { useState } from 'react';
import type { MemberProfile } from '../../data/ProfileData';

interface CartMemberProps {
    member: MemberProfile;
    swipeDirection: 'left' | 'right' | null;
}

export default function CartMember({
    member,
    swipeDirection
}: CartMemberProps) {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <Card
            shadow="xl"
            padding="lg"
            radius="xl"
            withBorder
            className={`w-full h-full ${swipeDirection === 'left' ? 'transition-all duration-300 translate-x-[-150%] opacity-0' : ''
                } ${swipeDirection === 'right' ? 'transition-all duration-300 translate-x-[150%] opacity-0' : ''}`}
        >
            {/* Background Section with Circular Avatar */}
            <Card.Section className="relative h-96 bg-gradient-to-br from-yellow-100 to-yellow-200">
                <img
                    src={member.background}
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

                {/* Circular Avatar - Bottom Left */}
                <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
                    <img
                        src={member.avatar}
                        alt={member.fullName}
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-2xl"
                    />
                </div>

                <div className="absolute bottom-0 left-32 sm:left-40 right-0 p-4 sm:p-6">
                    <Title order={2} c="white" mb={4}>
                        {member.fullName}
                    </Title>
                    <Text size="lg" c="yellow.3" fw={500}>
                        {member.role}
                    </Text>
                </div>
            </Card.Section>

            {/* Info Section */}
            <Stack gap="md" mt="md" mb={"xl"}>
                {/* Bio */}
                <Text size="sm" c="dimmed">
                    {member.bio}
                </Text>

                {/* Skills */}
                <div>
                    <Text size="xs" fw={600} c="dimmed" mb={8}>
                        Kỹ năng
                    </Text>
                    <Group gap="xs">
                        {member.skills.map((skill, index) => (
                            <Badge key={index} variant="light" color="blue" size="md">
                                {skill}
                            </Badge>
                        ))}
                    </Group>
                </div>

                {/* Toggle Details Button */}
                <Button
                    variant="subtle"
                    color="yellow"
                    fullWidth
                    onClick={() => setShowDetails(!showDetails)}
                    rightSection={
                        <ChevronDown className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
                    }
                >
                    {showDetails ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                </Button>

                {/* Collapsible Details */}
                <Collapse in={showDetails}>
                    <Stack gap="sm" pt="sm" pb={"lg"} className="border-t border-gray-200">
                        <Group gap="xs">
                            <MapPin className="w-4 h-4 text-yellow-500" />
                            <Text size="sm">{member.location}</Text>
                        </Group>
                        <Group gap="xs" align="flex-start">
                            <Mail className="w-4 h-4 text-yellow-500 mt-1" />
                            <Text size="sm" className="break-all">
                                {member.email}
                            </Text>
                        </Group>
                        <Group gap="xs">
                            <Text size="sm" fw={500}>
                                Kinh nghiệm:
                            </Text>
                            <Text size="sm">{member.experience}</Text>
                        </Group>
                    </Stack>
                </Collapse>
            </Stack>
        </Card>
    );
}
