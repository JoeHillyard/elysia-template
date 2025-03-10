import { useLocation, useNavigate } from "react-router";
import { useAuthToken } from "@hooks/jwt.hook";
import { useEffect, useState } from "react";
import { client } from "@utils/client";
import { findRouteByPath } from "../routes";
import { useAuthStore } from "@stores/auth.store";

export const useAuthRedirect = () => {

	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);
	const { setUserId } = useAuthStore();
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const [authToken, setAuthToken] = useAuthToken();

	const route = findRouteByPath(pathname);
	
	const { mutate: validateToken, isPending } = client.auth.validate.post.useMutation({
		onSuccess: (data) => {
			setIsAuthenticated(true);
			setUserId(data.user.userId);
			setIsInitialized(true);
		},
		onError: () => {
			setAuthToken('');
			setIsAuthenticated(false);
			setIsInitialized(true);
			if (!route?.isPublic) {
				navigate('/login');
			}
		}
	});

	useEffect(() => {
		if (!route?.isPublic && !authToken) {
			navigate('/login');
			return;
		}

		if (authToken && !isAuthenticated && !isPending && !isInitialized) {
			validateToken(
				{ token: authToken },
				{
					onSuccess: () => {
						setIsAuthenticated(true);
						setIsInitialized(true);
					}
				}
			);
		} else if (!route?.isPublic && !isAuthenticated && isInitialized) {
			navigate('/login', { replace: true });
		}
	}, [
		authToken,
		navigate,
		pathname,
		route,
		validateToken,
		isAuthenticated,
		isPending,
		isInitialized
	]);

	return {
		isAuthenticated,
		isInitialized
	};
};