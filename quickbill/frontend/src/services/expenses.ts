import api from "./api";

/**
 * Fetches all expenses and formats them for display.
 * @returns Promise containing formatted list of expenses with shares
 */
export const getExpenses = async () => {
	return api.get('expenses/expenses/').then((expenses) => {
		const friendList = expenses.map(expense => {
			return {
				id: expense.id,
				title: expense.title,
				amount: expense.amount,
				category: expense.category,
				notes: expense.notes,
				peopleCount: expense.shares.length,
				shares: expense.shares,
				created_at: expense.created_at,
			}
		});
		return friendList;
	})
};

/**
 * Creates a new expense record.
 * @param expense The expense data to create
 * @returns Promise containing the created expense
 */
export const createExpense = async (expense) => {
	return api.post('expenses/expenses/', expense).then((expense) => {
		return expense;
	})
};

/**
 * Gets the total expense balance for a user.
 * @param username The username to get total balance for
 * @returns Promise containing the user's total balance
 */
export const getTotalExpense = async (username) => {
	return api.get(`transactions/balances/total-balance/${username}/`)
}

/**
 * Gets expense analytics including category breakdown and spending trends.
 * @returns Promise containing analytics data
 */
export const getExpenseAnalytics = async () => {
	return api.get('expenses/expenses/analytics/').then((analytics) => {
		return analytics;
	})
};

/**
 * Gets personalized budgeting suggestions based on spending patterns.
 * @returns Promise containing budget suggestions
 */
export const getBudgetSuggestions = async () => {
	return api.get('expenses/expenses/budget_suggestions/').then((suggestions) => {
		return suggestions;
	})
};
