import {createRoot} from 'react-dom/client'
import './index.css'
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/notifications/styles.css';
import 'mantine-react-table/styles.css';
import {createTheme, localStorageColorSchemeManager, MantineProvider} from "@mantine/core";
import {Notifications} from "@mantine/notifications";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {RouterProvider} from "react-router";
import {createAppRouter} from "./routes";
import {client} from "@utils/client.ts";
import {useState} from "react";
import {httpLink} from "@ap0nia/eden-react-query";

const theme = createTheme({
	fontFamily: 'Open Sans, sans-serif',
	primaryColor: 'cyan',
});

const colorSchemeManager = localStorageColorSchemeManager({
	key: 'my-app-color-scheme',
});

const Wrapper = () => {
	const [queryClient] = useState(() => new QueryClient())

	const [edenClient] = useState(() => client.createClient({
		links: [httpLink({domain: 'http://localhost:3000'})]
	}))

	return (
		<client.Provider client={edenClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={createAppRouter()}/>
			</QueryClientProvider>
		</client.Provider>
	)
}

createRoot(document.getElementById('root')).render(
	<MantineProvider theme={theme} colorSchemeManager={colorSchemeManager}>
		<Notifications position={'top-right'}/>
		<Wrapper />
	</MantineProvider>
)

