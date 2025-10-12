import { DollarSign, Eye, EyeOff } from "lucide-react";
import { FormEvent, useState } from "react";
import { register } from "../services/register";

interface RegisterPageProps {
	setActiveTab: (tab: string) => void;
}

export function RegisterPage({ setActiveTab }: RegisterPageProps) {
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [userName, setUserName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState('');

	const handleRegister = async (e: FormEvent) => {
		e.preventDefault();
		try {
			register({
				first_name: firstName,
				last_name: lastName,
				username: userName,
				email,
				password,
				password2: confirmPassword
			})
			.then((data) => {
					if (data.username === userName) {
						setActiveTab('login')
					} else {
						setError('One or more fields are invalid. Please try again.');
					}
				}
			)
		} catch (error: unknown) {
			console.log(error);
			setError('One or more fields are invalid. Please try again.');
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<div className="flex justify-center">
					<div className="text-4xl font-bold text-indigo-600 flex items-center gap-2">
						<DollarSign className="h-12 w-12" />
						SplitWise
					</div>
				</div>
				<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
					Create your account
				</h2>
				<p className="mt-2 text-center text-sm text-gray-600">
					Already have an account?{' '}
					<button
						onClick={() => setActiveTab('login')}
						className="font-medium text-indigo-600 hover:text-indigo-500"
					>
						Sign in
					</button>
				</p>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
					{error && (
						<div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
							{error}
						</div>
					)}
					<form className="space-y-6" onSubmit={handleRegister}>
						<div>
							<label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
								First Name
							</label>
							<div className="mt-1">
								<input
									id="firstName"
									name="firstName"
									type="text"
									autoComplete="firstName"
									required
									value={firstName}
									onChange={(e) => setFirstName(e.target.value)}
									className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
									placeholder="John"
								/>
							</div>
						</div>
						<div>
							<label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
								Last Name
							</label>
							<div className="mt-1">
								<input
									id="lastName"
									name="lastName"
									type="text"
									autoComplete="lastName"
									required
									value={lastName}
									onChange={(e) => setLastName(e.target.value)}
									className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
									placeholder="Doe"
								/>
							</div>
						</div>

						<div>
							<label htmlFor="userName" className="block text-sm font-medium text-gray-700">
								User Name
							</label>
							<div className="mt-1">
								<input
									id="userName"
									name="userName"
									type="text"
									autoComplete="userName"
									required
									value={userName}
									onChange={(e) => setUserName(e.target.value)}
									className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
									placeholder="johndoe1"
								/>
							</div>
						</div>

						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700">
								Email address
							</label>
							<div className="mt-1">
								<input
									id="email"
									name="email"
									type="email"
									autoComplete="email"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
									placeholder="you@example.com"
								/>
							</div>
						</div>

						<div>
							<label htmlFor="password" className="block text-sm font-medium text-gray-700">
								Password
							</label>
							<div className="mt-1 relative">
								<input
									id="password"
									name="password"
									type={showPassword ? 'text' : 'password'}
									autoComplete="new-password"
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
									placeholder="••••••••"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute inset-y-0 right-0 pr-3 flex items-center"
								>
									{showPassword ? (
										<EyeOff className="h-5 w-5 text-gray-400" />
									) : (
										<Eye className="h-5 w-5 text-gray-400" />
									)}
								</button>
							</div>
						</div>

						<div>
							<label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
								Confirm Password
							</label>
							<div className="mt-1 relative">
								<input
									id="confirm-password"
									name="confirm-password"
									type={showConfirmPassword ? 'text' : 'password'}
									autoComplete="new-password"
									required
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
									placeholder="••••••••"
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className="absolute inset-y-0 right-0 pr-3 flex items-center"
								>
									{showConfirmPassword ? (
										<EyeOff className="h-5 w-5 text-gray-400" />
									) : (
										<Eye className="h-5 w-5 text-gray-400" />
									)}
								</button>
							</div>
						</div>

						<div>
							<button
								type="submit"
								className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
							>
								Create Account
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}