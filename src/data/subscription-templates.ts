export interface SubscriptionPlan {
	name: string;
	price: number; // in USD
	billingCycle: "monthly" | "yearly" | "weekly";
}

export interface SubscriptionTemplate {
	id: string;
	name: string;
	provider: string;
	category: string;
	color: string;
	plans: SubscriptionPlan[];
}

// All template prices are in USD — converted to user's local currency at display time
export const subscriptionTemplates: SubscriptionTemplate[] = [
	// ─── Netflix ───────────────────────────────────────────────
	{
		id: "netflix",
		name: "Netflix",
		provider: "Netflix Inc.",
		category: "Entertainment",
		color: "#E50914",
		plans: [
			{ name: "Standard with Ads", price: 7.99, billingCycle: "monthly" },
			{ name: "Standard", price: 17.99, billingCycle: "monthly" },
			{ name: "Premium", price: 24.99, billingCycle: "monthly" },
		],
	},

	// ─── YouTube Premium ───────────────────────────────────────
	{
		id: "youtube-premium",
		name: "YouTube Premium",
		provider: "Google LLC",
		category: "Entertainment",
		color: "#FF0000",
		plans: [
			{ name: "Premium Lite", price: 7.99, billingCycle: "monthly" },
			{ name: "Individual", price: 13.99, billingCycle: "monthly" },
			{ name: "Individual (Annual)", price: 139.99, billingCycle: "yearly" },
			{ name: "Family", price: 22.99, billingCycle: "monthly" },
		],
	},

	// ─── Claude (Anthropic) ────────────────────────────────────
	{
		id: "claude",
		name: "Claude",
		provider: "Anthropic",
		category: "Development",
		color: "#D97757",
		plans: [
			{ name: "Pro", price: 20.0, billingCycle: "monthly" },
			{ name: "Pro (Annual)", price: 17.0, billingCycle: "monthly" },
			{ name: "Max 5x", price: 100.0, billingCycle: "monthly" },
			{ name: "Max 20x", price: 200.0, billingCycle: "monthly" },
		],
	},

	// ─── 1Password ─────────────────────────────────────────────
	{
		id: "1password",
		name: "1Password",
		provider: "1Password (AgileBits)",
		category: "Productivity",
		color: "#0572EC",
		plans: [
			{ name: "Individual", price: 2.99, billingCycle: "monthly" },
			{ name: "Individual (Annual)", price: 35.88, billingCycle: "yearly" },
			{ name: "Families (up to 5)", price: 4.99, billingCycle: "monthly" },
			{ name: "Families (Annual)", price: 59.88, billingCycle: "yearly" },
		],
	},

	// ─── Duolingo ──────────────────────────────────────────────
	{
		id: "duolingo",
		name: "Duolingo",
		provider: "Duolingo Inc.",
		category: "Education",
		color: "#58CC02",
		plans: [
			{ name: "Super", price: 12.99, billingCycle: "monthly" },
			{ name: "Super (Annual)", price: 84.0, billingCycle: "yearly" },
			{ name: "Max", price: 29.99, billingCycle: "monthly" },
			{ name: "Max (Annual)", price: 167.99, billingCycle: "yearly" },
			{ name: "Family (up to 6)", price: 9.99, billingCycle: "monthly" },
			{ name: "Family (Annual)", price: 120.0, billingCycle: "yearly" },
		],
	},

	// ─── Apple iCloud+ ─────────────────────────────────────────
	{
		id: "icloud",
		name: "iCloud+",
		provider: "Apple Inc.",
		category: "Cloud Storage",
		color: "#007AFF",
		plans: [
			{ name: "50 GB", price: 0.99, billingCycle: "monthly" },
			{ name: "200 GB", price: 2.99, billingCycle: "monthly" },
			{ name: "2 TB", price: 9.99, billingCycle: "monthly" },
			{ name: "6 TB", price: 29.99, billingCycle: "monthly" },
			{ name: "12 TB", price: 59.99, billingCycle: "monthly" },
		],
	},

	// ─── Google One ────────────────────────────────────────────
	{
		id: "google-one",
		name: "Google One",
		provider: "Google LLC",
		category: "Cloud Storage",
		color: "#4285F4",
		plans: [
			{ name: "100 GB", price: 1.99, billingCycle: "monthly" },
			{ name: "100 GB (Annual)", price: 19.99, billingCycle: "yearly" },
			{ name: "2 TB", price: 9.99, billingCycle: "monthly" },
			{ name: "2 TB (Annual)", price: 99.99, billingCycle: "yearly" },
			{
				name: "AI Premium (2 TB + Gemini Advanced)",
				price: 19.99,
				billingCycle: "monthly",
			},
		],
	},
];
