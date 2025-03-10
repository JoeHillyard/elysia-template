import {AppShell, Burger, Button, Group, ScrollArea, Title} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import {Outlet} from "react-router";
import {navbarItems} from "./routes";

export function App() {

	const [opened, {toggle, open}] = useDisclosure(true);

	return (
		<AppShell
			header={{height: 60}}
			navbar={{
				width: 250,
				breakpoint: 'xs',
				collapsed: {mobile: !opened, desktop: !opened},
			}}
			padding="xl"
		>
			<AppShell.Header>
				<Group h={'100%'} gap={'xs'}>
					<Burger 
						hidden={false}
						opened={opened}
						onClick={toggle}
						size="sm"
					/>
					<Title order={2}>Game Builder</Title>
				</Group>

			</AppShell.Header>

			<AppShell.Navbar p="xs">
				<AppShell.Section grow my="md" component={ScrollArea}>
					{navbarItems}
				</AppShell.Section>
				<AppShell.Section>
					<Button> Log Out </Button>
				</AppShell.Section>
			</AppShell.Navbar>

			<AppShell.Main>
				<Outlet/>
			</AppShell.Main>
		</AppShell>
	)
}

