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
	icon: string; // simple-icons slug (e.g. "netflix", "youtube", "anthropic")
	plans: SubscriptionPlan[];
	/** Fields that remain editable even when using a template. By default all template fields are disabled. */
	editableFields?: Array<
		"name" | "provider" | "planName" | "price" | "billingCycle" | "category"
	>;
	/** Skip the plan selection step and go directly to the form */
	skipPlanSelection?: boolean;
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
		icon: "netflix",
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
		icon: "youtube",
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
		icon: "anthropic",
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
		icon: "1password",
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
		icon: "duolingo",
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
		icon: "icloud",
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
		icon: "google",
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
	// ─── Google Gemini ─────────────────────────────────────────
	// USD prices: https://gemini.google/us/subscriptions/?hl=en
	// VND prices: https://gemini.google/vn/subscriptions/?hl=vi
	{
		id: "google-gemini",
		name: "Google Gemini",
		provider: "Google LLC",
		category: "Development",
		color: "#8E75B2",
		icon: "googlegemini",
		plans: [
			{
				name: "AI Plus",
				prices: { USD: 7.99, VND: 132_000 },
				billingCycle: "monthly",
			},
			{
				name: "AI Pro",
				prices: { USD: 19.99, VND: 489_000 },
				billingCycle: "monthly",
			},
			{
				name: "AI Ultra",
				prices: { USD: 249.99, VND: 6_000_000 },
				billingCycle: "monthly",
			},
		],
	},

	// ─── Cloudflare Workers ────────────────────────────────────
	// USD prices: https://developers.cloudflare.com/workers/platform/pricing/
	// No confirmed VND regional pricing — using conversion fallback
	{
		id: "cloudflare-workers",
		name: "Cloudflare Workers",
		provider: "Cloudflare Inc.",
		category: "Development",
		color: "#F38020",
		icon: "cloudflareworkers",
		plans: [
			{
				name: "Workers Paid",
				prices: withFallbackVND(5.0),
				billingCycle: "monthly",
			},
		],
	},

	// ─── GitHub Copilot ────────────────────────────────────────
	// USD prices: https://github.com/features/copilot/plans
	// No confirmed VND regional pricing — using conversion fallback
	{
		id: "github-copilot",
		name: "GitHub Copilot",
		provider: "GitHub (Microsoft)",
		category: "Development",
		color: "#000000",
		icon: "githubcopilot",
		plans: [
			{
				name: "Pro",
				prices: withFallbackVND(10.0),
				billingCycle: "monthly",
			},
			{
				name: "Pro (Annual)",
				prices: withFallbackVND(100.0),
				billingCycle: "yearly",
			},
			{
				name: "Business",
				prices: withFallbackVND(19.0),
				billingCycle: "monthly",
			},
			{
				name: "Enterprise",
				prices: withFallbackVND(39.0),
				billingCycle: "monthly",
			},
		],
	},

	// ─── Domain Renewal ────────────────────────────────────────
	// Generic template — user fills in provider (Porkbun, Namecheap, etc.) and domain name
	{
		id: "domain-renewal",
		name: "Domain Renewal",
		provider: "",
		category: "Domain",
		color: "#334155",
		icon: "",
		editableFields: ["provider", "planName", "price", "billingCycle"],
		skipPlanSelection: true,
		plans: [
			{
				name: ".com",
				prices: withFallbackVND(10.0),
				billingCycle: "yearly",
			},
			{
				name: ".net",
				prices: withFallbackVND(12.0),
				billingCycle: "yearly",
			},
			{
				name: ".org",
				prices: withFallbackVND(12.0),
				billingCycle: "yearly",
			},
			{
				name: ".dev",
				prices: withFallbackVND(14.0),
				billingCycle: "yearly",
			},
			{
				name: ".io",
				prices: withFallbackVND(33.0),
				billingCycle: "yearly",
			},
		],
	},
];

/** Look up the icon slug for a subscription by name (case-insensitive match against template names) */
export function getIconSlugByName(name: string): string | undefined {
	const lower = name.toLowerCase();
	const match = subscriptionTemplates.find(
		(t) => t.name.toLowerCase() === lower || t.id === lower,
	);
	return match?.icon;
}
