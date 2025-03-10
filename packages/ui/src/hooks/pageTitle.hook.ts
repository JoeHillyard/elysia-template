import {useEffect} from "react";

export const usePageTitle = (title: string) => {
	useEffect(() => {
		// Save the original title to restore it when component unmounts
		const originalTitle = document.title;

		// Set new title
		document.title = title;

		// Cleanup function to restore original title when component unmounts
		return () => {
			document.title = originalTitle;
		};
	}, [title]); // Only re-run effect if title changes
};