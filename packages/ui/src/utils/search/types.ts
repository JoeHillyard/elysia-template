import type {ReactNode} from "react";

export interface SearchControlsProps {
	input: string;
	setInput: (value: string) => void;
	viewType: ViewType;
	setViewType: (type: ViewType) => void;
	isMobile?: boolean;
	hideControls?: boolean;
	title?: ReactNode;
}

export interface TagSectionProps<T> {
	opened: boolean;
	toggle: () => void;
	tags: SearchTag<T>[];
	toggleTag: (tag: SearchTag<T>) => void;
}

export interface SearchTag<T> {
	name: string;
	icon?: ReactNode;
	isActive: boolean;
	comparator: (target: T) => boolean;
}

export interface SortField {
	displayName: string;
	key: string;
}

export interface SearchWrapperProps<T> {
	children: (
		finalList: T[],
		viewType?: ViewType,
		disableImages?: boolean
	) => ReactNode;
	data: T[];
	searchFields?: (keyof T)[];
	sortFields?: SortField[];
	inputTags?: SearchTag<T>[];
	title?: ReactNode;
	notice?: ReactNode;
	hideControls?: boolean;
	inclusiveTags?: boolean;
	imageControl?: boolean;
}

export type ViewType = 'grid' | 'row' | 'table';
export type SortDirection = 'Asc' | 'Desc';