import { ActionIcon, Tooltip } from '@mantine/core';
import { FileText, Plus, Search, Users, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ButtonFunctionProps {
    onFindMember?: () => void;
    onCreatePost?: () => void;
}

export default function ButtonFunction({ onFindMember, onCreatePost }: ButtonFunctionProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();

    const handleFindMember = () => {
        setIsExpanded(false);
        if (onFindMember) {
            onFindMember();
        }
    };

    const handleCreatePost = () => {
        setIsExpanded(false);
        if (onCreatePost) {
            onCreatePost();
        }
    };

    const handleFindStartup = () => {
        setIsExpanded(false);
        navigate('/');
    };

    return (
        <div className="fixed bottom-8 right-8 z-50">
            {/* Overlay */}
            {isExpanded && (
                <div
                    className="fixed inset-0 bg-black/20 -z-10"
                    onClick={() => setIsExpanded(false)}
                />
            )}

            {/* Action Buttons */}
            <div className="flex flex-col-reverse items-end gap-2">
                {/* Find Startup Button */}
                {isExpanded && (
                    <div className="flex items-center gap-2 animate-slide-up">
                        <div className="bg-white px-2 py-1.5 rounded-lg shadow-lg">
                            <span className="text-xs font-medium whitespace-nowrap">Tìm Startup</span>
                        </div>
                        <Tooltip label="Tìm Startup" position="left">
                            <ActionIcon
                                size={44}
                                radius="xl"
                                variant="filled"
                                color="blue"
                                onClick={handleFindStartup}
                                className="hover:scale-110 active:scale-95 transition-transform shadow-2xl"
                            >
                                <Search className="w-5 h-5" />
                            </ActionIcon>
                        </Tooltip>
                    </div>
                )}

                {/* Find Member Button */}
                {isExpanded && (
                    <div className="flex items-center gap-2 animate-slide-up" style={{ animationDelay: '50ms' }}>
                        <div className="bg-white px-2 py-1.5 rounded-lg shadow-lg">
                            <span className="text-xs font-medium whitespace-nowrap">Tìm thành viên</span>
                        </div>
                        <Tooltip label="Tìm thành viên" position="left">
                            <ActionIcon
                                size={44}
                                radius="xl"
                                variant="filled"
                                color="green"
                                onClick={handleFindMember}
                                className="hover:scale-110 active:scale-95 transition-transform shadow-2xl"
                            >
                                <Users className="w-5 h-5" />
                            </ActionIcon>
                        </Tooltip>
                    </div>
                )}

                {/* Create Post Button */}
                {isExpanded && (
                    <div className="flex items-center gap-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
                        <div className="bg-white px-2 py-1.5 rounded-lg shadow-lg">
                            <span className="text-xs font-medium whitespace-nowrap">Tạo bài viết</span>
                        </div>
                        <Tooltip label="Tạo bài viết" position="left">
                            <ActionIcon
                                size={44}
                                radius="xl"
                                variant="filled"
                                color="yellow"
                                onClick={handleCreatePost}
                                className="hover:scale-110 active:scale-95 transition-transform shadow-2xl"
                            >
                                <FileText className="w-5 h-5" />
                            </ActionIcon>
                        </Tooltip>
                    </div>
                )}

                {/* Main Toggle Button */}
                <Tooltip label={isExpanded ? 'Đóng' : 'Thêm'} position="left">
                    <ActionIcon
                        size={52}
                        radius="xl"
                        variant="filled"
                        color="yellow"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="hover:scale-110 active:scale-95 transition-all"
                        style={{
                            transform: isExpanded ? 'rotate(45deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)'
                        }}
                    >
                        {isExpanded ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                    </ActionIcon>
                </Tooltip>
            </div>
        </div>
    );
}
