import { Avatar } from '@mantine/core';
import { Heart, MessageCircle, Share2, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import CommentService from '../service/CommentService';
import type { RootState } from '../store/store';
import type { CommentDto } from '../types/CommentType';
import type { StartUpDto } from '../types/StartupType';
import { formatTimeAgo } from '../untils/Helper';
import Comment from './Comment';
import type { CommentData } from './CommentItem';
import ModalApplyStartup, { type ApplyStartupFormData } from './ModalApplyStartup';
import ModalShare from './ModalShare';
import StartUpCardContent from './StartUpCardContent';
import StartUpCardContentShare from './StartUpCardContentShare';

interface StartUpCardProps {
    startup?: StartUpDto;
    id?: number;
    author?: string;
    time?: string;
    title?: string;
    score?: number;
    likes?: number;
    comments?: number;
    category?: string;
    evaluations?: Array<{
        title: string;
        score: number;
        maxScore: number;
        description: string;
    }>;
    avatarUrl?: string;
    commentsList?: CommentData[];
    isPublic?: boolean;
    isOwner?: boolean;
    onVisibilityChange?: (isPublic: boolean) => void;
    // Shared post props
    isShared?: boolean;
    sharedBy?: string;
    sharedByAvatar?: string;
    sharedTime?: string;
    shareComment?: string;
}

export default function StartUpCard(props: StartUpCardProps) {
    const {
        startup,
        commentsList = [],
        isOwner = false,
        onVisibilityChange,
        isShared = false,
        sharedBy,
        sharedByAvatar,
        sharedTime,
        shareComment
    } = props;

    // Extract data from startup or use legacy props
    const id = startup?.id ?? props.id ?? 0;
    const author = startup?.userFullName ?? props.author ?? '';
    const userId = startup?.userId;
    const time = startup ? formatTimeAgo(new Date(startup.createdAt)) : (props.time ?? '');
    const title = startup?.idea ?? props.title ?? '';
    const score = startup?.point ?? props.score ?? 0;
    const category = startup?.categoryName ?? props.category ?? 'Uncategorized';
    const visibility = startup ? startup.privacy === 1 : (props.isPublic ?? true);
    const avatarUrl = props.avatarUrl;

    const evaluations = startup ? [
        {
            title: 'Đội ngũ',
            score: startup.teamPoint ?? 0,
            maxScore: 20,
            description: startup.team
        },
        {
            title: 'Ý tưởng',
            score: startup.ideaPoint ?? 0,
            maxScore: 20,
            description: startup.idea
        },
        {
            title: 'Nguyên mẫu',
            score: startup.prototypePoint ?? 0,
            maxScore: 30,
            description: startup.prototype
        },
        {
            title: 'Kế hoạch',
            score: startup.planPoint ?? 0,
            maxScore: 10,
            description: startup.plan
        },
        {
            title: 'Mối quan hệ',
            score: startup.relationshipPoint ?? 0,
            maxScore: 20,
            description: startup.relationship
        },
    ] : (props.evaluations ?? []);

    const [isExpanded, setIsExpanded] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentsData, setCommentsData] = useState<CommentData[]>(commentsList);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [isPublicState, setIsPublicState] = useState(visibility);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [likesCount] = useState(props.likes ?? 0);

    const currentUser = useSelector((state: RootState) => state.auth.user);

    const applicants = [
        { id: 1, name: 'User 1', avatar: 'https://i.pravatar.cc/150?img=1' },
        { id: 2, name: 'User 2', avatar: 'https://i.pravatar.cc/150?img=2' },
        { id: 3, name: 'User 3', avatar: 'https://i.pravatar.cc/150?img=3' },
        { id: 4, name: 'User 4', avatar: 'https://i.pravatar.cc/150?img=4' },
        { id: 5, name: 'User 5', avatar: 'https://i.pravatar.cc/150?img=5' },
    ];

    const getScoreColor = (score: number) => {
        if (score >= 80) return {
            bg: 'bg-gradient-to-r from-green-100 to-green-200',
            text: 'text-green-600',
            light: 'text-green-400'
        };
        if (score >= 70) return {
            bg: 'bg-gradient-to-r from-purple-100 to-purple-200',
            text: 'text-purple-600',
            light: 'text-purple-400'
        };
        if (score >= 50) return {
            bg: 'bg-gradient-to-r from-[#FDE68A] to-[#FDE68A]',
            text: 'text-[#CA8A04]',
            light: 'text-[#CA8A04]'
        };
        return {
            bg: 'bg-gradient-to-r from-gray-100 to-gray-200',
            text: 'text-gray-600',
            light: 'text-gray-400'
        };
    };

    const getEvaluationColor = (score: number, maxScore: number) => {
        return score > maxScore / 2 ? '#10B981' : '#CA8A04';
    };

    const getEvaluationTextColor = (score: number, maxScore: number) => {
        return score > maxScore / 2 ? 'text-green-600' : 'text-[#CA8A04]';
    };

    const scoreColors = getScoreColor(score);

    useEffect(() => {
        const fetchComments = async () => {
            if (!id || isShared) return;

            try {
                setIsLoadingComments(true);
                const response = await CommentService.getCommentsByStartup(id);
                const transformedComments = transformApiCommentsToLocal(response.data);
                setCommentsData(transformedComments);
            } catch (error) {
                console.error('Error fetching comments:', error);
            } finally {
                setIsLoadingComments(false);
            }
        };

        if (showComments && commentsData.length === 0 && !commentsList.length) {
            fetchComments();
        }
    }, [showComments, id, isShared]);

    const transformApiCommentsToLocal = (apiComments: CommentDto[]): CommentData[] => {
        return apiComments.map(comment => ({
            id: comment.id,
            author: comment.userFullName,
            avatarUrl: comment.userAvatar || 'https://i.pravatar.cc/150?img=1',
            time: formatTimeAgo(new Date(comment.createdAt)),
            content: comment.content,
            likes: 0,
            replies: comment.replies ? transformApiCommentsToLocal(comment.replies) : []
        }));
    };

    const handleAddComment = async (content: string) => {
        if (!currentUser?.id) return;

        try {
            const response = await CommentService.createComment({
                startUpId: id,
                content: content,
            });

            const newComment: CommentData = {
                id: response.data.id,
                author: response.data.userFullName,
                avatarUrl: response.data.userAvatar || currentUser.avatar || 'https://i.pravatar.cc/150?img=1',
                time: 'Vừa xong',
                content: response.data.content,
                likes: 0,
                replies: []
            };

            setCommentsData([...commentsData, newComment]);
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleAddReply = async (commentId: number, content: string) => {
        if (!currentUser?.id) return;

        try {
            const response = await CommentService.createComment({
                startUpId: id,
                content: content,
                parentCommentId: commentId
            });

            const addReplyToComment = (comments: CommentData[]): CommentData[] => {
                return comments.map(comment => {
                    if (comment.id === commentId) {
                        const newReply: CommentData = {
                            id: response.data.id,
                            author: response.data.userFullName,
                            avatarUrl: response.data.userAvatar || currentUser.avatar || 'https://i.pravatar.cc/150?img=1',
                            time: 'Vừa xong',
                            content: response.data.content,
                            likes: 0,
                            replies: []
                        };
                        return {
                            ...comment,
                            replies: [...(comment.replies || []), newReply]
                        };
                    }
                    if (comment.replies) {
                        return {
                            ...comment,
                            replies: addReplyToComment(comment.replies)
                        };
                    }
                    return comment;
                });
            };
            setCommentsData(addReplyToComment(commentsData));
        } catch (error) {
            console.error('Error adding reply:', error);
        }
    };

    const handleVisibilityChange = (newVisibility: boolean) => {
        setIsPublicState(newVisibility);
        if (onVisibilityChange) {
            onVisibilityChange(newVisibility);
        }
        console.log('Visibility changed to:', newVisibility ? 'Public' : 'Private');
    };

    const handleEditPost = () => {
        console.log('Editing post:', id);
        // TODO: Open edit modal or navigate to edit page
    };

    const handleDeletePost = () => {
        console.log('Deleting post:', id);
        // TODO: Show confirmation modal and delete
    };

    const handleApplySubmit = async (data: ApplyStartupFormData) => {
        // The modal already handles the API call
        // This is just a callback for any additional actions
        console.log('Application submitted successfully');
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Render appropriate content based on type */}
            {isShared ? (
                <StartUpCardContentShare
                    sharedBy={sharedBy || ''}
                    sharedByAvatar={sharedByAvatar}
                    sharedTime={sharedTime || ''}
                    shareComment={shareComment}
                    originalAuthor={author}
                    originalAvatar={avatarUrl}
                    originalTime={time}
                    title={title}
                    score={score}
                    category={category}
                    visibility={isPublicState}
                    scoreColors={scoreColors}
                />
            ) : (
                <StartUpCardContent
                    id={id}
                    author={author}
                    time={time}
                    title={title}
                    score={score}
                    likes={likesCount}
                    commentsCount={commentsData.length}
                    category={category}
                    avatarUrl={avatarUrl}
                    visibility={isPublicState}
                    isOwner={isOwner}
                    scoreColors={scoreColors}
                    userId={userId}
                    onVisibilityChange={handleVisibilityChange}
                    onEditPost={handleEditPost}
                    onDeletePost={handleDeletePost}
                    onToggleComments={() => setShowComments(!showComments)}
                />
            )}

            {/* Evaluation Elements - Only show for non-shared posts */}
            {!isShared && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    {isExpanded ? (
                        <div className="space-y-3">
                            {evaluations.map((evaluation, idx) => (
                                <div key={idx} className="flex items-center space-x-3">
                                    <div className="relative w-16 h-16">
                                        <svg className="w-16 h-16 transform -rotate-90">
                                            <circle
                                                cx="32"
                                                cy="32"
                                                r="28"
                                                stroke="#E5E7EB"
                                                strokeWidth="4"
                                                fill="none"
                                            />
                                            <circle
                                                cx="32"
                                                cy="32"
                                                r="28"
                                                stroke={getEvaluationColor(evaluation.score, evaluation.maxScore)}
                                                strokeWidth="4"
                                                fill="none"
                                                strokeDasharray={`${(evaluation.score / evaluation.maxScore) * 125.6} 125.6`}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className={`text-xs font-bold ${getEvaluationTextColor(evaluation.score, evaluation.maxScore)}`}>
                                                {evaluation.score}/{evaluation.maxScore}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-700">{evaluation.title}</div>
                                        <div className="text-xs text-gray-500">{evaluation.description}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-5 gap-2 text-center">
                            {evaluations.map((evaluation, idx) => (
                                <div key={idx} className="flex flex-col items-center">
                                    <div className="relative w-16 h-16">
                                        <svg className="w-16 h-16 transform -rotate-90">
                                            <circle
                                                cx="32"
                                                cy="32"
                                                r="28"
                                                stroke="#E5E7EB"
                                                strokeWidth="4"
                                                fill="none"
                                            />
                                            <circle
                                                cx="32"
                                                cy="32"
                                                r="28"
                                                stroke={getEvaluationColor(evaluation.score, evaluation.maxScore)}
                                                strokeWidth="4"
                                                fill="none"
                                                strokeDasharray={`${(evaluation.score / evaluation.maxScore) * 125.6} 125.6`}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className={`text-xs font-bold ${getEvaluationTextColor(evaluation.score, evaluation.maxScore)}`}>
                                                {evaluation.score}/{evaluation.maxScore}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-xs font-medium text-gray-700 mt-1">{evaluation.title}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium flex mx-auto"
                    >
                        {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                    </button>
                </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4 text-gray-600">
                    <button className="flex items-center space-x-2 hover:text-red-500">
                        <Heart className="w-5 h-5" />
                        <span>{likesCount}</span>
                    </button>
                    <button
                        className="flex items-center space-x-2 hover:text-blue-500"
                        onClick={() => setShowComments(!showComments)}
                    >
                        <MessageCircle className="w-5 h-5" />
                        <span>{commentsData.length}</span>
                    </button>
                    <button
                        className="flex items-center space-x-2 hover:text-green-500"
                        onClick={() => setShowShareModal(true)}
                    >
                        <Share2 className="w-5 h-5" />
                        <span>Chia sẻ</span>
                    </button>
                </div>
                <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full">{category}</span>
                    {!isOwner && (
                        <button
                            onClick={() => setShowApplyModal(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-yellow-400 text-white rounded-full hover:bg-yellow-500 transition-colors font-medium text-sm"
                        >
                            <UserPlus className="w-4 h-4" />
                            <Avatar.Group spacing="sm">
                                {applicants.slice(0, 3).map((applicant) => (
                                    <Avatar
                                        key={applicant.id}
                                        src={applicant.avatar}
                                        size="sm"
                                        radius="xl"
                                    />
                                ))}
                                {applicants.length > 3 && (
                                    <Avatar size="sm" radius="xl">
                                        +{applicants.length - 3}
                                    </Avatar>
                                )}
                            </Avatar.Group>
                        </button>
                    )}
                </div>
            </div>

            {/* Comments Section */}
            <Comment
                showComments={showComments}
                comments={commentsData}
                onAddComment={handleAddComment}
                onAddReply={handleAddReply}
                isLoading={isLoadingComments}
            />

            {/* Share Modal */}
            <ModalShare
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                postId={id}
                postTitle={title}
            />

            {/* Apply Modal */}
            <ModalApplyStartup
                isOpen={showApplyModal}
                onClose={() => setShowApplyModal(false)}
                onSubmit={handleApplySubmit}
                startupId={id}
            />
        </div>
    );
}
