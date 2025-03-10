import {NotFoundFallback} from "@components/fallback.component.tsx";
import {DashboardPage} from "@pages/dashboard.page.tsx";
import {createBrowserRouter, Link, type RouteObject} from "react-router";
import {App} from "../app.tsx";
import {NavLink} from "@mantine/core";
import {UsersPage} from "@pages/users.page.tsx";
import {LoginPage} from "@pages/login.page.tsx";
import type {ComponentType} from "react";
import {clientLoader} from "@utils/loader-wrapper.ts";
import {FormBuilderPage} from "@pages/form-builder.page.tsx";
import {WidgetBuilderPage} from "@pages/widget-builder.page.tsx";

interface CustomRouteProps {
	icon?: ComponentType;
	href?: string
	label?: string;
	description?: string;
	hideMenu?: boolean;
	showChildren?: boolean;
	isPublic?: boolean;
}

type AppRoute = RouteObject & CustomRouteProps;

export const routes: AppRoute[] = [
	{
		path: '/',
		element: <App />,
		children: [
			{
				path: '',
				element: <DashboardPage />,
				loader: clientLoader,
				label: 'Home'
			},{
				path: '/widget',
				label: 'Widget Builder',
				element: <WidgetBuilderPage />
			},{
				path: '/form',
				label: 'Form Builder',
				element: <FormBuilderPage />
			},
			{
				path: 'users',
				label: 'Users',
				element: <UsersPage />,
				description: '',
			},
			{
				path: 'login',
				element: <LoginPage />,
				isPublic: true,
				hideMenu: true
			},
			{
				path: '*',
				element: <NotFoundFallback />,
				hideMenu: true,
			}
		]
	}
];

export const createAppRouter = () => createBrowserRouter(routes);

// Recursive function to create nested navigation
const createNavItems = (routes: AppRoute[], parentPath = '', isTopLevel = true) => {
	return routes
		.filter(route => !route.hideMenu)
		.map((route, index) => {

			const fullPath = parentPath ? `${parentPath}/${route.href || route.path}` : route.href || route.path;
			const hasVisibleChildren = route.children?.some(child => !child.hideMenu);
			const showChildren = route.showChildren && hasVisibleChildren;

			if (showChildren && route.children) {
				return (
					<NavLink
						key={index}
						component={Link}
						to={fullPath}
						label={route.label}
						description={route.description}
						leftSection={isTopLevel && route.icon && <route.icon />}
						childrenOffset={28}
						defaultOpened={true}
					>
						{createNavItems(route.children, fullPath, false)}
					</NavLink>
				);
			}

			return (
				<NavLink
					key={index}
					component={Link}
					to={fullPath}
					label={route.label}
					description={route.description}
					leftSection={isTopLevel && route.icon && <route.icon />}
					childrenOffset={28}
				/>
			);
		});
};

export const findRouteByPath = (pathname: string, localRoutes: AppRoute[] = routes ): AppRoute | undefined => {
	for (const route of localRoutes) {
		// Check if the current route matches
		if (route?.path === pathname) return route;

		// Check children routes
		if (route?.children) {
			const childRoute = findRouteByPath(pathname, route.children);
			if (childRoute) return childRoute;
		}
	}

	// Handle dynamic routes (like 'build/:deckId' or 'play/:sessionId')
	for (const route of localRoutes) {
		if (route.path?.includes(':')) {
			const routeParts = route.path.split('/');
			const pathnameParts = pathname.split('/');

			if (routeParts.length === pathnameParts.length) {
				let matches = true;
				for (let i = 0; i < routeParts.length; i++) {
					if (routeParts[i].startsWith(':')) continue;
					if (routeParts[i] !== pathnameParts[i]) {
						matches = false;
						break;
					}
				}
				if (matches) return route;
			}
		}
	}

	return undefined;
};

export const navbarItems = createNavItems(routes[0].children || []);