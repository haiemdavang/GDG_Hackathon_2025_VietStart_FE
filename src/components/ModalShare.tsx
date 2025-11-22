// import {
//     Button,
//     Group,
//     Modal,
//     Paper,
//     Stack,
//     Text,
//     Textarea
// } from '@mantine/core';
// import { Facebook, Mail, MessageCircle, Twitter } from 'lucide-react';
// import { useState } from 'react';
// import ShareService from '../service/ShareService';
// import showErrorNotification from '../Toast/NotificationError';
// import showSuccessNotification from '../Toast/NotificationSuccess';

// interface ModalShareProps {
//     isOpen: boolean;
//     onClose: () => void;
//     postId: number;
//     postTitle: string;
//     postUrl?: string;
// }

// export default function ModalShare({
//     isOpen,
//     onClose,
//     postId,
//     postTitle,
//     postUrl
// }: ModalShareProps) {
//     const [shareComment, setShareComment] = useState('');
//     const [isSubmitting, setIsSubmitting] = useState(false);

//     const shareLink = postUrl || `${window.location.origin}/post/${postId}`;

//     const handleShareToFacebook = () => {
//         const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`;
//         window.open(url, '_blank', 'width=600,height=400');
//     };

//     const handleShareToTwitter = () => {
//         const text = `${postTitle} - ${shareLink}`;
//         const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
//         window.open(url, '_blank', 'width=600,height=400');
//     };

//     const handleShareToEmail = () => {
//         const subject = encodeURIComponent(postTitle);
//         const body = encodeURIComponent(`Xem bài viết này: ${shareLink}`);
//         window.location.href = `mailto:?subject=${subject}&body=${body}`;
//     };

//     const handleShareToMessenger = () => {
//         const url = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareLink)}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(window.location.href)}`;
//         window.open(url, '_blank', 'width=600,height=400');
//     };

//     const handleShareWithComment = async () => {
//         if (!shareComment.trim()) {
//             showErrorNotification(
//                 'Thiếu thông tin',
//                 'Vui lòng viết điều gì đó về bài viết này'
//             );
//             return;
//         }

//         try {
//             setIsSubmitting(true);
//             await ShareService.createShare({
//                 startUpId: postId,
//                 content: shareComment.trim()
//             });

//             showSuccessNotification(
//                 'Chia sẻ thành công',
//                 'Bài viết đã được chia sẻ lên trang cá nhân của bạn'
//             );

//             setShareComment('');
//             onClose();
//         } catch (error: any) {
//             showErrorNotification(
//                 'Chia sẻ thất bại',
//                 error.message || 'Không thể chia sẻ bài viết. Vui lòng thử lại!'
//             );
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     const handleClose = () => {
//         setShareComment('');
//         onClose();
//     };

//     return (
//         <Modal
//             opened={isOpen}
//             onClose={handleClose}
//             title={<Text fw={600} size="lg">Chia sẻ bài viết</Text>}
//             size="md"
//             centered
//             radius="lg"
//         >
//             <Stack gap="lg">
//                 {/* Share comment textarea */}
//                 <Textarea
//                     placeholder="Viết điều gì đó về bài viết này..."
//                     value={shareComment}
//                     onChange={(e) => setShareComment(e.target.value)}
//                     minRows={3}
//                     autosize
//                     radius="md"
//                     disabled={isSubmitting}
//                 />

//                 {/* Preview startup content */}
//                 <Paper p="md" radius="md" withBorder bg="gray.0">
//                     <Text size="sm" fw={500} lineClamp={2}>
//                         {postTitle}
//                     </Text>
//                     <Text size="xs" c="dimmed" mt="xs">
//                         Bài viết startup
//                     </Text>
//                 </Paper>

//                 {/* Social media share icons and share button */}
//                 <Group justify="space-between" align="center">
//                     <Group gap="sm">
//                         <Button
//                             variant="subtle"
//                             color="blue"
//                             onClick={handleShareToFacebook}
//                             radius="md"
//                             p="xs"
//                             disabled={isSubmitting}
//                         >
//                             <Facebook size={20} />
//                         </Button>
//                         <Button
//                             variant="subtle"
//                             color="cyan"
//                             onClick={handleShareToTwitter}
//                             radius="md"
//                             p="xs"
//                             disabled={isSubmitting}
//                         >
//                             <Twitter size={20} />
//                         </Button>
//                         <Button
//                             variant="subtle"
//                             color="blue"
//                             onClick={handleShareToMessenger}
//                             radius="md"
//                             p="xs"
//                             disabled={isSubmitting}
//                         >
//                             <MessageCircle size={20} />
//                         </Button>
//                         <Button
//                             variant="subtle"
//                             color="red"
//                             onClick={handleShareToEmail}
//                             radius="md"
//                             p="xs"
//                             disabled={isSubmitting}
//                         >
//                             <Mail size={20} />
//                         </Button>
//                     </Group>

//                     <Button
//                         onClick={handleShareWithComment}
//                         radius="md"
//                         color="goldenDream"
//                         loading={isSubmitting}
//                         disabled={!shareComment.trim()}
//                     >
//                         Chia sẻ ngay
//                     </Button>
//                 </Group>
//             </Stack>
//         </Modal>
//     );
// }
