import {useState} from "react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {client} from "./utils/client.ts";
import {httpLink} from "@ap0nia/eden-react-query";
import {RouterProvider} from "react-router";
import {createAppRouter} from "./routes";
import {useAuthRedirect} from "@hooks/auth.hook.ts";

export function Main() {

	const [queryClient] = useState(() => new QueryClient())

	const [edenClient] = useState(() => client.createClient({
		links: [httpLink({domain: 'http://localhost:3000'})]
	}))

	/*const [utils] = useState(() => {
		/!**
		 * Use the context object to create utilities that act on the same queryClient and edenClient.
		 * This can be provided to load functions that run before context is rendered by React.
		 *!/
		const utils = client.createUtils({queryClient, client})
		return utils
	})*/

	return (
		<client.Provider client={edenClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={createAppRouter()}/>
			</QueryClientProvider>
		</client.Provider>
	)
}