import { ActionIcon, Button, Modal, Stack, Text, Title } from '@mantine/core';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { useRef, useState } from 'react';
import { memberProfiles, type MemberProfile } from '../../data/ProfileData';
import ButtonAction from './ButtonAction';
import CartMember from './CartMember';

interface FindMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectMember?: (member: MemberProfile) => void;
}

export default function FindMemberModal({ isOpen, onClose, onSelectMember }: FindMemberModalProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const filteredMembers = memberProfiles.filter(member => member.isAvailable);
    const currentMember = filteredMembers[currentIndex];

    const scrollToTop = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSwipe = (direction: 'left' | 'right') => {
        setSwipeDirection(direction);

        setTimeout(() => {
            if (direction === 'right' && currentMember && onSelectMember) {
                onSelectMember(currentMember);
            }

            if (currentIndex < filteredMembers.length - 1) {
                setCurrentIndex(prev => prev + 1);
                scrollToTop();
            }
            setSwipeDirection(null);
        }, 300);
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
            size="80vw"
            centered
            padding={2}
            title={
                <Title order={3}>
                    Tìm kiếm thành viên ({currentIndex + 1}/{filteredMembers.length})
                </Title>
            }
            styles={{
                body: {
                    padding: 0,
                    overflow: 'hidden',
                    position: 'relative',
                    height: '80vh'
                },
                header: {
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid #e9ecef',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    backgroundColor: 'white'
                },
                content: {
                    // height: '80vh'
                }
            }}
        >
            {/* Previous Button - Fixed Left */}
            {currentMember && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20">
                    {currentIndex > 0 ? (
                        <ActionIcon
                            size={40}
                            radius="xl"
                            variant="filled"
                            onClick={handlePrevious}
                            className="hover:scale-110 active:scale-95 transition-transform shadow-xl"
                            style={{ backgroundColor: 'white', color: '#6b7280' }}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </ActionIcon>
                    ) : (
                        <div className="w-10 h-10"></div>
                    )}
                </div>
            )}

            {/* Next Button - Fixed Right */}
            {currentMember && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
                    {currentIndex < filteredMembers.length - 1 ? (
                        <ActionIcon
                            size={40}
                            radius="xl"
                            variant="filled"
                            onClick={handleNext}
                            className="hover:scale-110 active:scale-95 transition-transform shadow-xl"
                            style={{ backgroundColor: 'white', color: '#6b7280' }}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </ActionIcon>
                    ) : (
                        <div className="w-10 h-10"></div>
                    )}
                </div>
            )}

            <div ref={scrollRef} className="overflow-y-auto h-full">
                {filteredMembers.length === 0 ? (
                    <Stack align="center" py="xl" px="lg">
                        <Text c="dimmed">Không có thành viên nào</Text>
                    </Stack>
                ) : currentMember ? (
                    <Stack gap="lg" align="center" p="lg">
                        <div className="w-full  mx-auto">
                            <CartMember
                                member={currentMember}
                                swipeDirection={swipeDirection}
                            />
                        </div>
                    </Stack>
                ) : (
                    <Stack align="center" py="xl" px="lg">
                        <ActionIcon size={80} radius="xl" variant="light" color="green">
                            <Heart className="w-10 h-10 fill-green-500" />
                        </ActionIcon>
                        <Title order={3}>Đã xem hết!</Title>
                        <Text c="dimmed">Bạn đã xem qua tất cả thành viên</Text>
                        <Button color="yellow" radius="xl" onClick={() => setCurrentIndex(0)} mt="md">
                            Xem lại từ đầu
                        </Button>
                    </Stack>
                )}
            </div>

            {/* Button Action - Fixed at Bottom */}
            {currentMember && (
                <div
                    className="absolute bottom-0 left-0 right-0 pb-6 pt-2"
                    style={{
                        background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 30%, transparent 100%)'
                    }}
                >
                    <ButtonAction
                        onAccept={() => handleSwipe('right')}
                        onReject={() => handleSwipe('left')}
                        disabled={swipeDirection !== null}
                    />
                </div>
            )}
        </Modal>
    );
}
