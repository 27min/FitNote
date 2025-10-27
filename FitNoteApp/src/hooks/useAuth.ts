import { useContext } from "react";

import { AuthContext } from "../contexts/AuthContext";

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth 훅은 AuthProvider 내부에서만 사용될 수 있습니다.');
    };
    return context;
}