import { ActionIcon, Group, Text } from '@mantine/core';
import { Heart, MessageCircle } from 'lucide-react';
import { useState } from 'react';

interface CommentContentProps {
    content: string;
    likes: number;
    onReply: () => void;
    onLike: () => void;
}

export default function CommentContent({ content, likes, onReply, onLike }: CommentContentProps) {
    const [isLiked, setIsLiked] = useState(false);

    const handleLike = () => {
        setIsLiked(!isLiked);
        onLike();
    };

    return (
        <div>
            <Text size="sm" c="dark" mb="xs">
                {content}
            </Text>
            <Group gap="md">
                <Group gap="xs">
                    <ActionIcon
                        variant="subtle"
                        size="sm"
                        color={isLiked ? 'red' : 'gray'}
                        onClick={handleLike}
                    >
                        <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
                    </ActionIcon>
                    <Text size="xs" c="dimmed">{likes}</Text>
                </Group>
                <Group gap="xs">
                    <ActionIcon
                        variant="subtle"
                        size="sm"
                        color="gray"
                        onClick={onReply}
                    >
                        <MessageCircle size={14} />
                    </ActionIcon>
                    <Text size="xs" c="dimmed">Trả lời</Text>
                </Group>
            </Group>
        </div>
    );
}
