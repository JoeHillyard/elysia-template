import {Box, Center, Chip, Collapse, Divider, Flex, Group, SegmentedControl, TextInput, Tooltip} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import type {SearchControlsProps, SearchWrapperProps, TagSectionProps, ViewType} from '@utils/search/types';
import {useEffect, useState} from 'react';
import {useIsMobile} from "@hooks/isMobile.hook.ts";
import { useFilterData, useTagManagement } from '@utils/search';
import {
	IconGridDots,
	IconLayoutBottombarCollapse,
	IconLayoutBottombarExpand, IconList,
	IconSearch,
	IconX
} from '@tabler/icons-react';


function SearchControls({
							input,
							setInput,
							viewType,
							setViewType,
							isMobile,
							hideControls,
							title
						}: SearchControlsProps) {
	const finalHideControls = hideControls || isMobile;

	return (
			<Flex
				gap={isMobile ? 5 : 'md'}
				align="center"
				justify="space-between"
				direction="row"
				wrap="wrap"
			>
				<TextInput
					placeholder="Search"
					size={isMobile ? 'sm' : 'md'}
					value={input}
					rightSection={
						!input ? (
							<IconSearch
								size={isMobile ? 14 : 18}
								style={{ color: '#ACAEBF' }}
							/>
						) : (
							<IconX
								size={18}
								style={{ color: '#ACAEBF' }}
								onClick={() => setInput('')}
							/>
						)
					}
					onChange={(e) => setInput(e.currentTarget.value)}
					w={isMobile ? 100 : 200}
				/>

				{title}

				{!finalHideControls && (
					<SegmentedControl
						size={isMobile ? 'sm' : 'md'}
						value={viewType}
						onChange={setViewType}
						data={[
							{
								label: (
									<Tooltip label="Grid">
										<Center style={{ gap: 10 }}>
											<IconGridDots size="1.2rem" />
										</Center>
									</Tooltip>
								),
								value: 'grid'
							},
							{
								label: (
									<Tooltip label="Row">
										<Center style={{ gap: 10 }}>
											<IconList size="1.2rem" />
										</Center>
									</Tooltip>
								),
								value: 'row'
							}
						]}
					/>
				)}
			</Flex>
	);
}

// components/TagSection.tsx
function TagSection<T>({opened, toggle, tags, toggleTag}: TagSectionProps<T>) {
	return (
		<div>
			<Divider
				my="xs"
				onClick={toggle}
				label={
					opened ? (
						<IconLayoutBottombarExpand size={28} />
					) : (
						<IconLayoutBottombarCollapse size={28} />
					)
				}
			/>

			<Collapse in={opened}>
				<Group justify="flex-start">
					{tags.map((tag, index) => (
						<Chip
							key={`${tag.name}-${index}`}
							checked={tag.isActive}
							onClick={() => toggleTag(tag)}
							value="products"
							radius="sm"
							icon={tag.icon}
						>
							{tag.name}
						</Chip>
					))}
				</Group>
			</Collapse>
		</div>
	);
}

export function SearchWrapper<T>({
									 data,
									 inputTags = [],
									 children,
									 searchFields = [],
									 sortFields = [],
									 hideControls,
									 title,
									 inclusiveTags = false,
									 notice
								 }: SearchWrapperProps<T>) {
	const isMobile = useIsMobile();
	const [opened, { toggle }] = useDisclosure(!isMobile);

	// Load view type from localStorage only once on mount
	const [viewType, setViewType] = useState<ViewType>(() => {
		const savedViewType = localStorage.getItem('viewType') as ViewType;
		return isMobile ? 'grid' : (savedViewType || 'grid');
	});

	const { tags, toggleTag, resetTags } = useTagManagement(inputTags);
	const { input, setInput, filteredData } = useFilterData(data, searchFields, tags, inclusiveTags);

	// Separate effect for mobile view type changes
	useEffect(() => {
		if (isMobile) {
			setViewType('grid');
		}
	}, [isMobile]);

	// Separate effect for saving view type
	useEffect(() => {
		if (viewType && !isMobile) {
			localStorage.setItem('viewType', viewType);
		}
	}, [viewType, isMobile]);

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
			<SearchControls
				input={input}
				setInput={setInput}
				viewType={viewType}
				setViewType={setViewType}
				isMobile={isMobile}
				hideControls={hideControls}
				title={title}
			/>

			{inputTags.length > 0 && (
				<TagSection
					opened={opened}
					toggle={toggle}
					tags={tags}
					toggleTag={toggleTag}
				/>
			)}

			{notice}

			<Divider my={'sm'} />

			<Box sx={{
				flex: '1 1 auto',
				overflowY: 'auto',
				overflowX: 'hidden',
				minHeight: 700
			}}>
				{children(filteredData, viewType)}
			</Box>
		</Box>
	);
}