import { useMediaQuery } from '@mantine/hooks';
import { em } from '@mantine/core';

export const useIsMobile = () => {
	return useMediaQuery(`(max-width: ${em(720)})`)
}
