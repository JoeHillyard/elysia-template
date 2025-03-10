import {useLocalStorage} from "@mantine/hooks";

export const useAuthToken = () => {
	return useLocalStorage<string>({
		key: 'game-builder-jwt',
		defaultValue: ''
	});
}
