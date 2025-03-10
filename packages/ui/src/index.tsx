import {createRoot} from 'react-dom/client'
import './index.css'
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/notifications/styles.css';
import 'mantine-react-table/styles.css';

import {createTheme, localStorageColorSchemeManager, MantineProvider} from "@mantine/core";
import {Main} from "./main.tsx";
import {Notifications} from "@mantine/notifications";

const theme = createTheme({
	fontFamily: 'Open Sans, sans-serif',
	primaryColor: 'cyan',
});

const colorSchemeManager = localStorageColorSchemeManager({
	key: 'my-app-color-scheme',
});

createRoot(document.getElementById('root')).render(
	<MantineProvider theme={theme} colorSchemeManager={colorSchemeManager}>
		<Notifications position={'top-right'}/>
		<Main/>
	</MantineProvider>
)

