import {create} from "zustand/index";


type AuthStore = {
	userId: string | undefined
	setUserId: (userId: string) => void
}

export const useAuthStore = create<AuthStore>()(
	(set) => ({
		userId: undefined,
		setUserId: (userId) => set({userId})
	})
)
