import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
    sub?: string;
    userId?: string;
    id?: string;
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'?: string;
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'?: string;
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string;
    FullName?: string;
    aud?: string;
    exp?: number;
    iss?: string;
    [key: string]: any;
}

export const getUserIdFromToken = (token: string): string | null => {
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Handle XML schema namespace claims
        return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
            || payload.sub
            || payload.userId
            || payload.id
            || null;
    } catch (error) {
        return null;
    }
};

export const getEmailFromToken = (token: string): string | null => {
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Handle XML schema namespace claims
        return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
            || payload.email
            || null;
    } catch (error) {
        return null;
    }
};

export const getRoleFromToken = (token: string): string | null => {
    try {
        const decoded = jwtDecode<JwtPayload>(token);
        return decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

export const getFullNameFromToken = (token: string): string | null => {
    try {
        const decoded = jwtDecode<JwtPayload>(token);
        return decoded.FullName || null;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

export const isTokenExpired = (token: string): boolean => {
    try {
        const decoded = jwtDecode<{ exp?: number }>(token);
        if (!decoded.exp) return true;
        return decoded.exp * 1000 < Date.now();
    } catch (error) {
        return true;
    }
};


export const formatTimeAgo = (input: string | Date): string => {
    const date = input instanceof Date ? input : new Date(input);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    if (isNaN(diffMs)) return '';

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSeconds < 60) return "vừa xong";
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    if (diffMonths < 12) return `${diffMonths} tháng trước`;

    return `${diffYears} năm trước`;
};