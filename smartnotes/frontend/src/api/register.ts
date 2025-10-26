import api from './api';

/**
 * Interface for user registration data
 */
interface RegisterCredentials {
	first_name: string;
	last_name: string;
	username: string;
	email: string;
	password: string;
	password2: string;
}

/**
 * Interface for successful registration response
 */
interface RegisterResponse {
	user_name: string;
	email: string;
	first_name: string;
	last_name: string;
}

/**
 * Registers a new user with the provided credentials.
 * @param credentials The registration data including personal info and passwords
 * @returns Promise containing the newly created user's data
 */
export const register = async (credentials: RegisterCredentials) => {
	const response = await api.post<RegisterResponse>('/users/register/', credentials);
	return response
};
