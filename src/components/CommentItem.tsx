import { Avatar, Button, Group, Stack, Text, Textarea } from '@mantine/core';
import { useState } from 'react';
import CommentContent from './CommentContent';

export interface CommentData {
    id: number;
    author: string;
    avatarUrl?: string;
    time: string;
    content: string;
    likes: number;
    replies?: CommentData[];
}

interface CommentItemProps {
    comment: CommentData;
    level?: number;
    onAddReply?: (commentId: number, content: string) => void;
}

export default function CommentItem({ comment, level = 0, onAddReply }: CommentItemProps) {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyContent, setReplyContent] = useState('');

    const handleReply = () => {
        setShowReplyInput(!showReplyInput);
    };

    const handleSubmitReply = () => {
        if (replyContent.trim() && onAddReply) {
            onAddReply(comment.id, replyContent);
            setReplyContent('');
            setShowReplyInput(false);
        }
    };

    const handleLike = () => {
        console.log('Liked comment:', comment.id);
    };

    return (
        <div>
            <Group align="flex-start" gap="sm">
                <Avatar src={comment.avatarUrl} size={level === 0 ? 40 : 32} radius="xl" />
                <Stack gap="xs" style={{ flex: 1 }}>
                    <Group gap="xs">
                        <Text size="sm" fw={600}>{comment.author}</Text>
                        <Text size="xs" c="dimmed">{comment.time}</Text>
                    </Group>

                    <CommentContent
                        content={comment.content}
                        likes={comment.likes}
                        onReply={level < 1 ? handleReply : () => { }}
                        onLike={handleLike}
                    />

                    {/* Reply Input */}
                    {showReplyInput && level < 1 && (
                        <div style={{ marginTop: '0.5rem' }}>
                            <Textarea
                                placeholder="Viết phản hồi..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.currentTarget.value)}
                                minRows={2}
                                autosize
                                size="xs"
                            />
                            <Group gap="xs" mt="xs">
                                <Button
                                    size="xs"
                                    color="yellow"
                                    onClick={handleSubmitReply}
                                    disabled={!replyContent.trim()}
                                >
                                    Gửi
                                </Button>
                                <Button
                                    size="xs"
                                    variant="subtle"
                                    color="gray"
                                    onClick={() => setShowReplyInput(false)}
                                >
                                    Hủy
                                </Button>
                            </Group>
                        </div>
                    )}
                </Stack>
            </Group>

            {/* Nested Replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div style={{ marginLeft: level === 0 ? '3rem' : '2rem', marginTop: '1rem' }}>
                    <Stack gap="md">
                        {comment.replies.map((reply) => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                level={level + 1}
                                onAddReply={onAddReply}
                            />
                        ))}
                    </Stack>
                </div>
            )}
        </div>
    );
}
