import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  setUser: (user: User | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  signOut: () => Promise<void>;
  checkAdminStatus: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAdmin: true,
  setUser: (user) => set({ user }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAdmin: false });
  },
  checkAdminStatus: async (userId) => {
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("is_super_admin")
        .eq("id", userId);

      if (error) {
        console.error("Error checking admin status:", error);
        set({ isAdmin: false });
        return;
      }

      set({ isAdmin: data && data.length > 0 && data[0].is_super_admin });
    } catch (err) {
      console.error("Error checking admin status:", err);
      set({ isAdmin: false});
    }
  },
}));
