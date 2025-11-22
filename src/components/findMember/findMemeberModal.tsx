import { ActionIcon, Button, Loader, Modal, Stack, Text, Title, Box } from '@mantine/core';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import StartupService from '../../service/StartupService';
import TeamStartupService from '../../service/TeamStartupService';
import showErrorNotification from '../../Toast/NotificationError';
import showSuccessNotification from '../../Toast/NotificationSuccess';
import type {  SuggestUsersResponse, UserSuggestionDto } from '../../types/StartupType';
import ButtonAction from './ButtonAction';
import CartMember from './CartMember';

interface FindMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    startupId?: number | null;
    onSelectMember?: (member: UserSuggestionDto) => void;
}

export default function FindMemberModal({ isOpen, onClose, startupId, onSelectMember }: FindMemberModalProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [suggestedUsers, setSuggestedUsers] = useState<UserSuggestionDto[]>([]);
    const [isHovering, setIsHovering] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && startupId) {
            fetchSuggestedUsers();
        } 
    }, [isOpen, startupId]);

    const fetchSuggestedUsers = async () => {
        if (!startupId) return;

        setIsLoading(true);
        try {
            const response = await StartupService.getSuggestedUsers(startupId);
            const suggestionsData: SuggestUsersResponse = response.data;

            setSuggestedUsers(suggestionsData.suggestions);
            setCurrentIndex(0);
        } catch (error: any) {
            console.error('Error fetching suggested users:', error);
            showErrorNotification(
                'Lỗi tải gợi ý',
                error.message || 'Không thể tải danh sách thành viên được gợi ý'
            );
            setSuggestedUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredMembers = suggestedUsers;
    const currentMember = filteredMembers[currentIndex];

    const scrollToTop = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSwipe = async (direction: 'left' | 'right') => {
        setSwipeDirection(direction);

        if (direction === 'right' && currentMember && startupId) {
            try {
                // Gọi API invite user vào startup
                await TeamStartupService.inviteStartUp(startupId, currentMember.userId);
           
                showSuccessNotification(
                    'Gửi lời mời thành công',
                    `Đã gửi lời mời tham gia startup đến ${currentMember.fullName}`
                );
                
                // Gọi callback nếu có
                if (onSelectMember) {
                    onSelectMember(currentMember);
                }

                // Chỉ chuyển sang user tiếp theo khi thành công
                setTimeout(() => {
                    if (currentIndex < filteredMembers.length - 1) {
                        setCurrentIndex(prev => prev + 1);
                        scrollToTop();
                    }
                    setSwipeDirection(null);
                }, 300);

            } catch (error: any) {
                console.error('Error inviting user:', error);
                showErrorNotification(
                    'Lỗi gửi lời mời',
                    error.message || 'Không thể gửi lời mời tham gia'
                );
                // Reset swipe direction nếu lỗi
                setSwipeDirection(null);
            }
        } else if (direction === 'left') {
            // Reject - chuyển sang user tiếp theo
            setTimeout(() => {
                if (currentIndex < filteredMembers.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                    scrollToTop();
                }
                setSwipeDirection(null);
            }, 300);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            scrollToTop();
        }
    };

    const handleNext = () => {
        if (currentIndex < filteredMembers.length - 1) {
            setCurrentIndex(prev => prev + 1);
            scrollToTop();
        }
    };

    return (
        <Modal
            opened={isOpen}
            onClose={onClose}
            size="md"
            centered
            padding={0}
            withCloseButton={false}
            styles={{
                body: {
                    padding: 0,
                    overflow: 'hidden',
                    position: 'relative',
                    minHeight: '500px',
                    maxHeight: '600px'
                },
                header: {
                    display: 'none'
                }
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* Previous Button - Fixed Left */}
            {currentMember && isHovering && currentIndex > 0 && (
                <Box pos="absolute" left={8} top="50%" style={{ transform: 'translateY(-50%)', zIndex: 20 }}>
                    <ActionIcon
                        size={36}
                        radius="xl"
                        variant="filled"
                        onClick={handlePrevious}
                        style={{ 
                            backgroundColor: 'white', 
                            color: '#6b7280',
                            transition: 'all 0.2s',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            opacity: isHovering ? 1 : 0
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <ChevronLeft size={18} />
                    </ActionIcon>
                </Box>
            )}

            {/* Next Button - Fixed Right */}
            {currentMember && isHovering && currentIndex < filteredMembers.length - 1 && (
                <Box pos="absolute" right={8} top="50%" style={{ transform: 'translateY(-50%)', zIndex: 20 }}>
                    <ActionIcon
                        size={36}
                        radius="xl"
                        variant="filled"
                        onClick={handleNext}
                        style={{ 
                            backgroundColor: 'white', 
                            color: '#6b7280',
                            transition: 'all 0.2s',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            opacity: isHovering ? 1 : 0
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <ChevronRight size={18} />
                    </ActionIcon>
                </Box>
            )}

            <Box ref={scrollRef} style={{ overflowY: 'auto', height: '100%' }}>
                {isLoading ? (
                    <Stack align="center" justify="center" style={{ minHeight: '400px' }}>
                        <Loader size="lg" color="yellow" />
                        <Text c="dimmed" mt="md">Đang tìm kiếm thành viên phù hợp...</Text>
                    </Stack>
                ) : filteredMembers.length === 0 ? (
                    <Stack align="center" py="xl" px="lg">
                        <Text c="dimmed">Không có thành viên nào</Text>
                    </Stack>
                ) : currentMember ? (
                    <Box style={{  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CartMember
                            member={currentMember}
                            swipeDirection={swipeDirection}
                        />
                    </Box>
                ) : (
                    <Stack align="center" py="xl" px="lg">
                        <ActionIcon size={80} radius="xl" variant="light" color="green">
                            <Heart size={40} fill="currentColor" />
                        </ActionIcon>
                        <Title order={3}>Đã xem hết!</Title>
                        <Text c="dimmed">Bạn đã xem qua tất cả thành viên</Text>
                        <Button color="yellow" radius="xl" onClick={() => setCurrentIndex(0)} mt="md">
                            Xem lại từ đầu
                        </Button>
                    </Stack>
                )}
            </Box>

            {/* Button Action - Fixed at Bottom */}
            {currentMember && (
                <Box
                    pos="absolute"
                    bottom={0}
                    left={0}
                    right={0}
                    p="md"
                    style={{
                            backgroundColor: 'white',
                            borderTop: '1px solid #e9ecef'
                    }}
                >
                    <ButtonAction
                        onAccept={() => handleSwipe('right')}
                        onReject={() => handleSwipe('left')}
                        disabled={swipeDirection !== null}
                    />
                </Box>
            )}
        </Modal>
    );
}
