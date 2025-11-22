import { Modal, Stack, Text, Title } from '@mantine/core';
import { motion } from 'framer-motion';
import { CheckCircle, Heart, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SweetSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    memberName: string;
}

export default function SweetSuccessModal({ isOpen, onClose, memberName }: SweetSuccessModalProps) {
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShowConfetti(true);
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    return (
        <Modal
            opened={isOpen}
            onClose={onClose}
            withCloseButton={false}
            centered
            size="auto"
            padding={0}
            styles={{
                body: {
                    padding: 0,
                    background: 'transparent',
                },
                content: {
                    background: 'transparent',
                    boxShadow: 'none',
                }
            }}
        >
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                style={{
                    background: 'linear-gradient(135deg, #f2dc1d 0%, #f59e0b 100%)',
                    borderRadius: '24px',
                    padding: '3rem 2rem',
                    position: 'relative',
                    overflow: 'hidden',
                    minWidth: '400px',
                }}
            >
                {/* Animated background circles */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: 'easeInOut',
                    }}
                    style={{
                        position: 'absolute',
                        top: '-50%',
                        right: '-20%',
                        width: '200px',
                        height: '200px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.3)',
                    }}
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: 'easeInOut',
                        delay: 0.5,
                    }}
                    style={{
                        position: 'absolute',
                        bottom: '-30%',
                        left: '-10%',
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.2)',
                    }}
                />

                <Stack align="center" gap="lg" style={{ position: 'relative', zIndex: 1 }}>
                    {/* Success Icon with animation */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    >
                        <div style={{ position: 'relative' }}>
                            <motion.div
                                animate={{
                                    rotate: [0, 360],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Number.POSITIVE_INFINITY,
                                    ease: 'linear',
                                }}
                                style={{
                                    position: 'absolute',
                                    top: '-10px',
                                    left: '-10px',
                                    right: '-10px',
                                    bottom: '-10px',
                                }}
                            >
                                <Sparkles size={80} color="#ffffff" opacity={0.8} />
                            </motion.div>
                            <CheckCircle size={60} color="#f2dc1d" fill="#ffffff" />
                        </div>
                    </motion.div>

                    {/* Title */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Title order={2} c="white" ta="center" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                            Gửi lời mời thành công! 🎉
                        </Title>
                    </motion.div>

                    {/* Message */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Text size="lg" c="white" ta="center" style={{ maxWidth: '350px' }}>
                            Đã gửi lời mời tham gia startup đến
                        </Text>
                        <Text size="xl" fw={700} c="white" ta="center" mt="xs" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                            {memberName}
                        </Text>
                    </motion.div>

                    {/* Floating hearts */}
                    {[...Array(5)].map((_, index) => (
                        <motion.div
                            key={index}
                            initial={{ y: 0, opacity: 1 }}
                            animate={{
                                y: -100,
                                opacity: 0,
                                x: [0, (Math.random() - 0.5) * 50],
                            }}
                            transition={{
                                duration: 2,
                                delay: index * 0.2,
                                repeat: Number.POSITIVE_INFINITY,
                                repeatDelay: 1,
                            }}
                            style={{
                                position: 'absolute',
                                bottom: '10%',
                                left: `${20 + index * 15}%`,
                            }}
                        >
                            <Heart size={24} fill="#ffffff" color="#ffffff" />
                        </motion.div>
                    ))}
                </Stack>
            </motion.div>
        </Modal>
    );
}
