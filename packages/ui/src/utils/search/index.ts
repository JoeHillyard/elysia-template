import type {SearchTag, SortDirection} from "@utils/search/types.ts";
import {useDebouncedValue} from '@mantine/hooks';
import {go} from 'fuzzysort';
import {useMemo, useState} from 'react';

export function useTagManagement<T>(initialTags: SearchTag<T>[]) {
	const [tags, setTags] = useState(initialTags);

	const toggleTag = (targetTag: SearchTag<T>) => {
		setTags(currentTags =>
			currentTags.map(tag =>
				tag.name === targetTag.name
					? { ...tag, isActive: !tag.isActive }
					: tag
			)
		);
	};

	const resetTags = () => {
		setTags(currentTags =>
			currentTags.map(tag => ({ ...tag, isActive: false }))
		);
	};

	return { tags, toggleTag, resetTags };
}

export function useFilterData<T>(
	initialData: T[],
	searchFields: (keyof T)[],
	tags: SearchTag<T>[],
	inclusiveTags: boolean
) {
	const [input, setInput] = useState('');
	const [debouncedInput] = useDebouncedValue(input, 200);

	const filteredData = useMemo(() => {
		let result = initialData;

		// Apply search filter
		if (debouncedInput) {
			result = go<T>(debouncedInput, result, {
				keys: searchFields as string[],
				limit: 30,
				threshold: -1000
			}).map(r => r.obj);
		}

		// Apply tag filters
		const activeTags = tags.filter(tag => tag.isActive);
		if (activeTags.length > 0) {
			result = inclusiveTags
				? result.filter(item => activeTags.some(tag => tag.comparator(item)))
				: result.filter(item => activeTags.every(tag => tag.comparator(item)));
		}

		return result;
	}, [initialData, debouncedInput, tags, searchFields, inclusiveTags]);

	return { input, setInput, filteredData };
}

export function filterInclusive<T>(data: T[], tags: SearchTag<T>[]): T[] {
	return data.filter(item =>
		tags.some(tag => tag.comparator(item) && tag.isActive)
	).map(item => ({
		...item,
		filterTags: tags.filter(tag => tag.comparator(item) && tag.isActive)
	}));
}

export function filterExclusive<T>(data: T[], tags: SearchTag<T>[]): T[] {
	return data.filter(item =>
		tags.every(tag => !tag.isActive || tag.comparator(item))
	).map(item => ({
		...item,
		filterTags: tags.filter(tag => tag.comparator(item))
	}));
}

export function sortData<T>(
	data: T[],
	field: keyof T,
	direction: SortDirection
): T[] {
	return [...data].sort((a, b) => {
		const aValue = a[field];
		const bValue = b[field];

		if (typeof aValue === 'string' && typeof bValue === 'string') {
			return direction === 'Asc'
				? aValue.localeCompare(bValue)
				: bValue.localeCompare(aValue);
		}

		if (typeof aValue === 'number' && typeof bValue === 'number') {
			return direction === 'Asc'
				? aValue - bValue
				: bValue - aValue;
		}

		return 0;
	});
}