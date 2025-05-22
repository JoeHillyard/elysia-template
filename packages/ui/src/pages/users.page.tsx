import {useMemo, useState} from 'react';
import {MantineReactTable, type MRT_ColumnDef, useMantineReactTable,} from 'mantine-react-table';
import {IconDevicesPlus, IconX} from "@tabler/icons-react";
import {Button, Divider, Group, Modal, TextInput, Tooltip} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";

const data = [
	{
		firstName: 'John',
		lastName: 'John',
		email: 'email@email.com',
	},
	{
		firstName: 'John',
		lastName: 'John',
		email: 'email@email.com',
	},
];

export function UsersPage() {

	const [opened, {open, close}] = useDisclosure(false);
	const [email, setEmail] = useState('')

	const columns = useMemo<MRT_ColumnDef<Partial<UserSelect>>[]>(
		() => [
			{
				id: 'name',
				header: 'Name',
				accessorFn: (originalRow) => `${originalRow.firstName} ${originalRow.lastName}`
			},
			{
				header: 'Email',
				accessorKey: 'email'
			},
			{
				header: 'Actions',
				size: 25,
				Cell: (row) => (
					<Group>
						<Tooltip label="Invite to game">
							<IconDevicesPlus/>
						</Tooltip>
						<Tooltip label="Remove">
							<IconX/>
						</Tooltip>
					</Group>
				)
			}
		], []
	);

	const table = useMantineReactTable({
		enableSorting: false,
		columns, data,
		renderTopToolbarCustomActions: ({table}) =>
			<Button size={'compact-md'} onClick={open}>
				Add Friend
			</Button>
	})

	return (
		<div>
			<Modal opened={opened} onClose={close} title="Add Friend" centered>
				<Divider mb={'sm'}/>
				<Group justify={'space-between'} gap={'xs'}>
					<TextInput w={'70%'} label={'Email'} type={'email'} onChange={(e) => setEmail(e.target.value)}/>
					<Button w={'25%'} mt={25}> Add </Button>
				</Group>
			</Modal>
			<MantineReactTable table={table}/>
		</div>
	)
}