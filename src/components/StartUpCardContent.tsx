import { ActionIcon, Menu } from '@mantine/core';
import { Edit, Globe, Lock, MoreVertical, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StartUpCardContentProps {
    id: number;
    author: string;
    time: string;
    title: string;
    score: number;
    likes: number;
    commentsCount: number;
    category: string;
    avatarUrl?: string;
    visibility: boolean;
    isOwner: boolean;
    scoreColors: {
        bg: string;
        text: string;
        light: string;
    };
    userId?: string;
    onVisibilityChange: (isPublic: boolean) => void;
    onEditPost: () => void;
    onDeletePost: () => void;
    onToggleComments: () => void;
}

export default function StartUpCardContent({
    author,
    time,
    title,
    score,
    avatarUrl,
    visibility,
    isOwner,
    scoreColors,
    userId,
    onVisibilityChange,
    onEditPost,
    onDeletePost
}: StartUpCardContentProps) {
    const navigate = useNavigate();

    const handleNavigateToProfile = () => {
        if (userId) {
            navigate(`/profile/${userId}`);
        }
    };

    return (
        <>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div
                        className="w-10 h-10 bg-gray-800 rounded-full overflow-hidden cursor-pointer hover:ring-2 hover:ring-yellow-400 hover:!underline transition"
                        onClick={handleNavigateToProfile}
                    >
                        {avatarUrl && <img src={avatarUrl} alt={author} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                        <h3
                            className="font-semibold cursor-pointer hover:text-yellow-600 hover:!underline transition"
                            onClick={handleNavigateToProfile}
                        >
                            {author}
                        </h3>
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-500">{time}</p>
                            {visibility ? (
                                <Globe size={14} className="text-green-600" />
                            ) : (
                                <Lock size={14} className="text-gray-600" />
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`flex items-center space-x-2 rounded-[50px] px-3 py-1 ${scoreColors.bg}`}>
                        <Rocket className={`w-4 h-4 ${scoreColors.text}`} />
                        <span className={`text-2xl font-bold ${scoreColors.text}`}>{score}</span>
                        <span className={scoreColors.light}>/100</span>
                    </div>

                    {isOwner && (
                        <Menu position="bottom-end" shadow="md">
                            <Menu.Target>
                                <ActionIcon variant="subtle" color="gray">
                                    <MoreVertical size={20} />
                                </ActionIcon>
                            </Menu.Target>

                            <Menu.Dropdown>
                                <Menu.Label>Hành động</Menu.Label>
                                <Menu.Item leftSection={<Edit size={16} />} onClick={onEditPost}>
                                    Chỉnh sửa bài viết
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Label>Quyền riêng tư</Menu.Label>
                                <Menu.Item
                                    leftSection={<Globe size={16} />}
                                    onClick={() => onVisibilityChange(true)}
                                >
                                    Công khai
                                </Menu.Item>
                                <Menu.Item
                                    leftSection={<Lock size={16} />}
                                    onClick={() => onVisibilityChange(false)}
                                    color={!visibility ? 'blue' : undefined}
                                >
                                    Riêng tư
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item color="red" onClick={onDeletePost}>
                                    Xóa bài viết
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    )}
                </div>
            </div>

            <h2 className="text-xl font-bold mb-3">{title}</h2>
        </>
    );
}
