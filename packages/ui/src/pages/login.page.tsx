import {
	Anchor,
	Button,
	Container,
	Divider,
	Group,
	Paper,
	type PaperProps,
	PasswordInput,
	Stack,
	TextInput,
	Title,
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {upperFirst, useToggle} from '@mantine/hooks';
import {useAuthToken} from "@hooks/jwt.hook.ts";
import { useNavigate } from 'react-router';

export function LoginPage(props: PaperProps) {

	const [type, toggle] = useToggle(['login', 'register']);
	const [, setAuthToken] = useAuthToken()
	const navigate = useNavigate();

	const form = useForm({
		initialValues: {
			firstName: '',
			lastName: '',
			email: '',
			password: ''
		},
		validate: {
			email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
			password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
		},
	});

	const opts = {
		onSuccess: ({access_token}: {access_token: string}) =>  {
			setAuthToken(access_token)
			navigate('/')
		}
	}


	const submit = (values: typeof form.values) => {
		if (type === 'register') {
			//register(values)
		} else {
			//login({ email: values.email, password: values.password })
		}
	}

	return (
		<Container w={'80%'}>

			<Paper radius="md" p="xl" withBorder {...props}>
				<Title order={2} fw={500} ta={'center'}>
					Game Builder
				</Title>

				<Divider my={'md'}/>

				<form onSubmit={form.onSubmit((e) => submit(e))}>
					<Stack>
						{type === 'register' && (
							<Group grow>
								<TextInput
									label="Name"
									placeholder="First name"
									value={form.values.firstName}
									onChange={(event) => form.setFieldValue('firstName', event.currentTarget.value)}
									radius="md"
								/>
								<TextInput
									label="Name"
									placeholder="Last Name"
									value={form.values.lastName}
									onChange={(event) => form.setFieldValue('lastName', event.currentTarget.value)}
									radius="md"
								/>
							</Group>
						)}

						<TextInput
							required
							label="Email"
							type={'email'}
							placeholder="hello@mantine.dev"
							value={form.values.email}
							onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
							error={form.errors.email && 'Invalid email'}
							radius="md"
						/>

						<PasswordInput
							required
							label="Password"
							type={'password'}
							placeholder="Your password"
							value={form.values.password}
							onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
							error={form.errors.password && 'Password should include at least 6 characters'}
							radius="md"
						/>
					</Stack>

					<Group justify="space-between" mt="xl">
						<Anchor component="button" type="button" c="dimmed" onClick={() => toggle()} size="xs">
							{type === 'register'
								? 'Already have an account? Login'
								: "Don't have an account? Register"}
						</Anchor>
						<Button type="submit" radius="xl">
							{upperFirst(type)}
						</Button>
					</Group>
				</form>
			</Paper>
		</Container>
	);
}