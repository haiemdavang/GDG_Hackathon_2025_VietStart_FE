import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ProfileData } from '../types/ProfileType';
import { getUserIdFromToken } from '../untils/Helper';

interface AuthState {
    user: ProfileData | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<ProfileData>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        setUser: (state, action: PayloadAction<ProfileData>) => {
            state.user = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },
        loadUserFromToken: (state, action: PayloadAction<string>) => {
            const userId = getUserIdFromToken(action.payload);
            if (userId) {
                state.isAuthenticated = true;
            }
        },
    },
});

export const { setCredentials, setUser, logout, loadUserFromToken } = authSlice.actions;
export default authSlice.reducer;
