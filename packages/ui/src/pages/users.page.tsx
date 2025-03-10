import {useMemo, useState} from 'react';
import {MantineReactTable, type MRT_ColumnDef, useMantineReactTable,} from 'mantine-react-table';
import type {UserSelectSchema} from "api/src/db/schema.ts";
import {IconDevicesPlus, IconX} from "@tabler/icons-react";
import {Button, Divider, Group, Modal, TextInput, Tooltip} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";

const data: Pick<UserSelectSchema, 'firstName' | 'lastName' | 'email'>[] = [
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

	const columns = useMemo<MRT_ColumnDef<Partial<UserSelectSchema>>[]>(
		() => [
			{
				accessorFn: (originalRow) => `${originalRow.firstName} ${originalRow.lastName}`,
				id: 'name',
				header: 'Name'
			},
			{
				accessorKey: 'email',
				header: 'Email'
			},
			{
				header: 'Actions',
				size: 25,
				Cell: (row: UserSelectSchema) => (
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