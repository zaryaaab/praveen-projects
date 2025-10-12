import api from './api';
import { useSessionStore } from '../store/sessionStore';

/**
 * Interface for user login credentials
 */
interface LoginCredentials {
	username: string;
	password: string;
}

/**
 * Authenticates a user with their credentials and stores the session.
 * @param credentials The user's login credentials
 * @returns Promise containing the authentication response with token and user data
 */
export const login = async (credentials: LoginCredentials) => {
	let response
	try {
		response = await api.post('/accounts/login/', credentials);
		const { token, user_id, email, first_name, last_name } = response
		console.log({ token, user_id, email, first_name, last_name });
		// Update session store with user data
		useSessionStore.getState().setSession(token, {
			id: user_id,
			email,
			firstName: first_name,
			lastName: last_name
		});
		window.localStorage.setItem('token', token);
		return response;
	}
	catch (err) {
		return response;
	}
};

/**
 * Fetches the current user's profile data using stored token.
 * @returns Promise containing the user's profile data or undefined if no token exists
 */
export const fetchUserData = async () => {
	const token = window.localStorage.getItem('token');
	if (!token) {
		return;
	}
	const response = await api.get('/accounts/profile/', {
		headers: {
			Authorization: `Token ${token}`
		}
	});

	const { id, email, first_name, last_name, username } = response;
	useSessionStore.getState().setSession(token, {
		id,
		email,
		firstName: first_name,
		lastName: last_name,
		username: username,
	});
	console.log(useSessionStore.getState().getUserData())
	return response;
};
