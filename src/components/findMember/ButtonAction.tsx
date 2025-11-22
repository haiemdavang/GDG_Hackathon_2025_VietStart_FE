import { Button } from '@mantine/core';

interface ButtonActionProps {
    onAccept: () => void;
    onReject: () => void;
    disabled?: boolean;
}

export default function ButtonAction({ onAccept, onReject, disabled = false }: ButtonActionProps) {
    return (
        <div className="flex justify-center gap-4">
            <Button
                size="md"
                radius="xl"
                variant="outline"
                onClick={onReject}
                disabled={disabled}
                className="hover:scale-105 active:scale-95 transition-transform shadow-xl"
                style={{ minWidth: '120px' }}
            >
                Bỏ qua
            </Button>

            <Button
                size="md"
                radius="xl"
                variant="filled"
                onClick={onAccept}
                disabled={disabled}
                className="hover:scale-105 active:scale-95 transition-transform shadow-xl"
                style={{ minWidth: '120px' }}
            >
                Chiêu mộ
            </Button>
        </div>
    );
}
