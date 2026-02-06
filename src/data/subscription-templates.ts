import { convertCurrency, type SupportedCurrency } from "@/lib/currency-utils";

export interface SubscriptionPlan {
	name: string;
	prices: Record<SupportedCurrency, number>;
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

/** Helper: given a USD price, compute VND via exchange rate fallback */
function withFallbackVND(usd: number): Record<SupportedCurrency, number> {
	return { USD: usd, VND: Math.round(convertCurrency(usd, "USD", "VND")) };
}

// Regional prices sourced from official pricing pages where available.
// Services without confirmed VND prices use USD→VND conversion as fallback.
export const subscriptionTemplates: SubscriptionTemplate[] = [
	// ─── Netflix ───────────────────────────────────────────────
	// VND prices: https://dtinews.dantri.com.vn (Jul 2025 post-tax)
	{
		id: "netflix",
		name: "Netflix",
		provider: "Netflix Inc.",
		category: "Entertainment",
		color: "#E50914",
		plans: [
			{
				name: "Mobile (480p)",
				prices: { USD: 7.99, VND: 74_000 },
				billingCycle: "monthly",
			},
			{
				name: "Standard (720p)",
				prices: { USD: 17.99, VND: 114_000 },
				billingCycle: "monthly",
			},
			{
				name: "Standard (1080p)",
				prices: { USD: 17.99, VND: 231_000 },
				billingCycle: "monthly",
			},
			{
				name: "Premium (4K)",
				prices: { USD: 24.99, VND: 273_000 },
				billingCycle: "monthly",
			},
		],
	},

	// ─── YouTube Premium ───────────────────────────────────────
	// VND prices: https://vietnaminsiders.com (Apr 2023 launch pricing)
	{
		id: "youtube-premium",
		name: "YouTube Premium",
		provider: "Google LLC",
		category: "Entertainment",
		color: "#FF0000",
		plans: [
			{
				name: "Individual",
				prices: { USD: 13.99, VND: 79_000 },
				billingCycle: "monthly",
			},
			{
				name: "Family",
				prices: { USD: 22.99, VND: 149_000 },
				billingCycle: "monthly",
			},
		],
	},

	// ─── Claude (Anthropic) ────────────────────────────────────
	// No confirmed VND regional pricing — using conversion fallback
	{
		id: "claude",
		name: "Claude",
		provider: "Anthropic",
		category: "Development",
		color: "#D97757",
		plans: [
			{
				name: "Pro",
				prices: withFallbackVND(20.0),
				billingCycle: "monthly",
			},
			{
				name: "Pro (Annual)",
				prices: withFallbackVND(17.0),
				billingCycle: "monthly",
			},
			{
				name: "Max 5x",
				prices: withFallbackVND(100.0),
				billingCycle: "monthly",
			},
			{
				name: "Max 20x",
				prices: withFallbackVND(200.0),
				billingCycle: "monthly",
			},
		],
	},

	// ─── 1Password ─────────────────────────────────────────────
	// No confirmed VND regional pricing — using conversion fallback
	{
		id: "1password",
		name: "1Password",
		provider: "1Password (AgileBits)",
		category: "Productivity",
		color: "#0572EC",
		plans: [
			{
				name: "Individual",
				prices: withFallbackVND(2.99),
				billingCycle: "monthly",
			},
			{
				name: "Individual (Annual)",
				prices: withFallbackVND(35.88),
				billingCycle: "yearly",
			},
			{
				name: "Families (up to 5)",
				prices: withFallbackVND(4.99),
				billingCycle: "monthly",
			},
			{
				name: "Families (Annual)",
				prices: withFallbackVND(59.88),
				billingCycle: "yearly",
			},
		],
	},

	// ─── Duolingo ──────────────────────────────────────────────
	// No confirmed VND regional pricing — using conversion fallback
	{
		id: "duolingo",
		name: "Duolingo",
		provider: "Duolingo Inc.",
		category: "Education",
		color: "#58CC02",
		plans: [
			{
				name: "Super",
				prices: withFallbackVND(12.99),
				billingCycle: "monthly",
			},
			{
				name: "Super (Annual)",
				prices: withFallbackVND(84.0),
				billingCycle: "yearly",
			},
			{
				name: "Max",
				prices: withFallbackVND(29.99),
				billingCycle: "monthly",
			},
			{
				name: "Max (Annual)",
				prices: withFallbackVND(167.99),
				billingCycle: "yearly",
			},
			{
				name: "Family (up to 6)",
				prices: withFallbackVND(9.99),
				billingCycle: "monthly",
			},
			{
				name: "Family (Annual)",
				prices: withFallbackVND(120.0),
				billingCycle: "yearly",
			},
		],
	},

	// ─── Apple iCloud+ ─────────────────────────────────────────
	// VND prices: https://support.apple.com/en-vn/108047
	{
		id: "icloud",
		name: "iCloud+",
		provider: "Apple Inc.",
		category: "Cloud Storage",
		color: "#007AFF",
		plans: [
			{
				name: "50 GB",
				prices: { USD: 0.99, VND: 19_000 },
				billingCycle: "monthly",
			},
			{
				name: "200 GB",
				prices: { USD: 2.99, VND: 69_000 },
				billingCycle: "monthly",
			},
			{
				name: "2 TB",
				prices: { USD: 9.99, VND: 249_000 },
				billingCycle: "monthly",
			},
			{
				name: "6 TB",
				prices: { USD: 29.99, VND: 749_000 },
				billingCycle: "monthly",
			},
			{
				name: "12 TB",
				prices: { USD: 59.99, VND: 1_499_000 },
				billingCycle: "monthly",
			},
		],
	},

	// ─── Google One ────────────────────────────────────────────
	// VND prices: https://en.anonyviet.com/how-to-upgrade-google-one-100gb-for-only-7000-vnd-month/
	{
		id: "google-one",
		name: "Google One",
		provider: "Google LLC",
		category: "Cloud Storage",
		color: "#4285F4",
		plans: [
			{
				name: "100 GB",
				prices: { USD: 1.99, VND: 7_000 },
				billingCycle: "monthly",
			},
			{
				name: "100 GB (Annual)",
				prices: { USD: 19.99, VND: 72_000 },
				billingCycle: "yearly",
			},
			{
				name: "2 TB",
				prices: { USD: 9.99, VND: 36_000 },
				billingCycle: "monthly",
			},
			{
				name: "2 TB (Annual)",
				prices: { USD: 99.99, VND: 364_000 },
				billingCycle: "yearly",
			},
			{
				name: "AI Premium (2 TB + Gemini Advanced)",
				prices: { USD: 19.99, VND: 122_000 },
				billingCycle: "monthly",
			},
		],
	},
];
