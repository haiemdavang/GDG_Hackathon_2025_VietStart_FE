import { Button, Collapse, Divider, Stack, Text, Textarea } from '@mantine/core';
import { useState } from 'react';
import CommentItem, { type CommentData } from './CommentItem';

interface CommentProps {
    showComments: boolean;
    comments: CommentData[];
    onAddComment: (content: string) => void;
    onAddReply: (commentId: number, content: string) => void;
    isLoading?: boolean;
}

export default function Comment({
    showComments,
    comments,
    onAddComment,
    onAddReply,
    isLoading = false
}: CommentProps) {
    const [newComment, setNewComment] = useState('');

    const handleAddComment = () => {
        if (newComment.trim()) {
            onAddComment(newComment);
            setNewComment('');
        }
    };

    if (!showComments) return null;

    return (
        <div className="mt-4 pt-4 border-t border-gray-100">
            <Collapse in={showComments}>
                <Divider my="md" />
                <Stack gap="md">
                    {/* Comment Input */}
                    <div>
                        <Textarea
                            placeholder="Viết bình luận..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.currentTarget.value)}
                            minRows={2}
                            autosize
                        />
                        <Button
                            size="xs"
                            color="yellow"
                            mt="sm"
                            onClick={handleAddComment}
                            disabled={!newComment.trim()}
                        >
                            Bình luận
                        </Button>
                    </div>

                    {/* Comments List */}
                    {isLoading ? (
                        <div className="py-4 text-center text-gray-500">
                            <p className="text-sm">Đang tải bình luận...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {comments.length > 0 ? (
                                <Stack gap="lg">
                                    {comments.map((comment) => (
                                        <CommentItem
                                            key={comment.id}
                                            comment={comment}
                                            onAddReply={onAddReply}
                                        />
                                    ))}
                                </Stack>
                            ) : (
                                <Text size="sm" c="dimmed" ta="center" py="lg">
                                    Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                                </Text>
                            )}
                        </div>
                    )}
                </Stack>
            </Collapse>
        </div>
    );
}
