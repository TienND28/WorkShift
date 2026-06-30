import { useSyncExternalStore } from "react";

import { authStore } from "@/stores/authStore";



export function useAuth() {

  const user = useSyncExternalStore(

    authStore.subscribe,

    authStore.getSnapshot,

    authStore.getSnapshot,

  );



  return {

    user,

    isAuthenticated: authStore.isAuthenticated(),

    // Stable refs — không dùng .bind() (mỗi render tạo hàm mới → useEffect lặp vô hạn)

    loginWithGoogle: authStore.loginWithGoogle,

    verifyEmailLogin: authStore.verifyEmailLogin,

    selectProfileType: authStore.selectProfileType,

    setUser: authStore.setUser,

    refreshMe: authStore.refreshMe,

    logout: authStore.logout,

    hydrate: authStore.hydrate,

  };

}

