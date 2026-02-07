import {
	CalendarClock,
	CreditCard,
	DollarSign,
	TrendingUp,
} from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
import { BrandIcon } from "@/components/brand-icon";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getIconSlugByName } from "@/data/subscription-templates";
import type { subscription } from "@/db/schema";
import {
	convertCurrency,
	formatCurrency,
	type SupportedCurrency,
} from "@/lib/currency-utils";
import { daysUntil, formatDate } from "@/lib/date-utils";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "./ui/chart";

type Subscription = typeof subscription.$inferSelect;

const CATEGORY_COLORS = [
	"var(--color-teal-200)",
	"var(--color-teal-300)",
	"var(--color-teal-400)",
	"var(--color-teal-500)",
	"var(--color-teal-600)",
	"var(--color-teal-700)",
	"var(--color-teal-800)",
	"var(--color-teal-900)",
];

interface CategoryData {
	name: string;
	count: number;
	amount: number;
	fill: string;
}

const chartConfig = {
	entertainment: {
		label: "Entertainment",
	},
	productivity: {
		label: "Productivity",
	},
	development: {
		label: "Development",
	},
} satisfies ChartConfig;

export function DashboardStats({
	subscriptions,
	currency,
}: {
	subscriptions: Subscription[];
	currency: SupportedCurrency;
}) {
	const active = subscriptions.filter((s) => s.status === "active");

	// Convert all amounts to user's currency for totals
	const monthlyTotal = active.reduce((sum, s) => {
		const converted = convertCurrency(
			s.price,
			s.currency as SupportedCurrency,
			currency,
		);
		if (s.billingCycle === "monthly") return sum + converted;
		if (s.billingCycle === "yearly") return sum + converted / 12;
		if (s.billingCycle === "weekly") return sum + converted * 4.33;
		return sum;
	}, 0);

	const yearlyTotal = monthlyTotal * 12;

	const upcoming = active
		.filter(
			(s) =>
				s.nextBillingDate &&
				daysUntil(s.nextBillingDate) >= 0 &&
				daysUntil(s.nextBillingDate) <= 30,
		)
		.sort((a, b) => {
			if (!a.nextBillingDate || !b.nextBillingDate) return 0;
			return (
				new Date(a.nextBillingDate).getTime() -
				new Date(b.nextBillingDate).getTime()
			);
		});

	// Build category data with amounts
	const categoryMap = active.reduce(
		(acc, s) => {
			const cat = s.category || "Uncategorized";
			const converted = convertCurrency(
				s.price,
				s.currency as SupportedCurrency,
				currency,
			);
			const monthlyAmount =
				s.billingCycle === "yearly"
					? converted / 12
					: s.billingCycle === "weekly"
						? converted * 4.33
						: converted;
			if (!acc[cat]) acc[cat] = { count: 0, amount: 0 };
			acc[cat].count += 1;
			acc[cat].amount += monthlyAmount;
			return acc;
		},
		{} as Record<string, { count: number; amount: number }>,
	);

	const categoryData: CategoryData[] = Object.entries(categoryMap)
		.sort(([, a], [, b]) => b.amount - a.amount)
		.map(([name, data], i) => ({
			name,
			count: data.count,
			amount: data.amount,
			fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
		}));

	return (
		<div className="space-y-6">
			<div
				data-tour="stats-cards"
				className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
			>
				<Card>
					<CardHeader>
						<CardDescription>Monthly Spend</CardDescription>
						<CardTitle className="text-3xl font-bold tabular-nums @[250px]/card:text-3xl">
							{formatCurrency(monthlyTotal, currency)}
						</CardTitle>
						<CardAction>
							<DollarSign className="h-4 w-4 text-muted-foreground" />
						</CardAction>
					</CardHeader>
					<CardFooter className="flex-col items-start gap-1.5 text-sm">
						<div className="text-muted-foreground">
							Based on active subscriptions
						</div>
					</CardFooter>
				</Card>
				<Card>
					<CardHeader>
						<CardDescription>Yearly Spend</CardDescription>
						<CardTitle className="text-3xl font-bold tabular-nums @[250px]/card:text-3xl">
							{formatCurrency(yearlyTotal, currency)}
						</CardTitle>
						<CardAction>
							<TrendingUp className="h-4 w-4 text-muted-foreground" />
						</CardAction>
					</CardHeader>
					<CardFooter className="flex-col items-start gap-1.5 text-sm">
						<div className="text-muted-foreground">Projected annual spend</div>
					</CardFooter>
				</Card>
				<Card>
					<CardHeader>
						<CardDescription>Active Subs</CardDescription>
						<CardTitle className="text-3xl font-bold tabular-nums @[250px]/card:text-3xl">
							{active.length}
						</CardTitle>
						<CardAction>
							<CreditCard className="h-4 w-4 text-muted-foreground" />
						</CardAction>
					</CardHeader>
					<CardFooter className="flex-col items-start gap-1.5 text-sm">
						<div className="text-muted-foreground">
							<span className="font-medium text-foreground">
								{subscriptions.length - active.length}
							</span>{" "}
							inactive
						</div>
					</CardFooter>
				</Card>
				<Card>
					<CardHeader>
						<CardDescription>Upcoming</CardDescription>
						<CardTitle className="text-3xl font-bold tabular-nums @[250px]/card:text-3xl">
							{upcoming.length}
						</CardTitle>
						<CardAction>
							<CalendarClock className="h-4 w-4 text-muted-foreground" />
						</CardAction>
					</CardHeader>
					<CardFooter className="flex-col items-start gap-1.5 text-sm">
						<div className="text-muted-foreground">in the next 30 days</div>
					</CardFooter>
				</Card>
			</div>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<Card data-tour="upcoming-renewals">
					<CardHeader>
						<CardTitle className="text-base">Upcoming Renewals</CardTitle>
					</CardHeader>
					<CardContent>
						{upcoming.length === 0 ? (
							<p className="text-sm text-muted-foreground">
								No upcoming renewals
							</p>
						) : (
							<div className="space-y-3">
								{upcoming.map((s) => {
									const iconSlug = getIconSlugByName(s.name);
									const days = daysUntil(s.nextBillingDate);
									const isUrgent = days <= 3;
									return (
										<div
											key={s.id}
											className="flex items-center justify-between"
										>
											<div className="flex items-center gap-2.5">
												{iconSlug ? (
													<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
														<BrandIcon slug={iconSlug} size={16} />
													</div>
												) : (
													<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
														{s.name.charAt(0)}
													</div>
												)}
												<div>
													<p className="text-sm font-medium">{s.name}</p>
													<p className="text-xs text-muted-foreground">
														{formatDate(s.nextBillingDate)}
													</p>
												</div>
											</div>
											<div className="flex flex-col items-end gap-0.5">
												<span className="text-sm font-medium">
													{formatCurrency(
														s.price,
														s.currency as SupportedCurrency,
														{
															convertTo: currency as SupportedCurrency,
														},
													)}
												</span>
												<span
													className={`text-xs ${isUrgent ? "font-medium text-destructive" : "text-muted-foreground"}`}
												>
													{days === 0
														? "Today"
														: days === 1
															? "Tomorrow"
															: `${days}d left`}
												</span>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</CardContent>
				</Card>

				<Card data-tour="category-breakdown">
					<CardHeader>
						<CardTitle className="text-base">
							Monthly Spend by Category
						</CardTitle>
					</CardHeader>
					<CardContent>
						{categoryData.length === 0 ? (
							<p className="text-sm text-muted-foreground">No categories yet</p>
						) : (
							<div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
								{/* Donut Chart */}
								<div className="flex-shrink-0">
									<ChartContainer
										className="h-[180px] w-[180px]"
										config={chartConfig}
									>
										<PieChart>
											<ChartTooltip
												cursor={false}
												content={
													<ChartTooltipContent
														className="min-w-[200px]"
														hideLabel
													/>
												}
											/>
											<Pie
												data={categoryData}
												dataKey="amount"
												nameKey="name"
												innerRadius={55}
												outerRadius={80}
												strokeWidth={0}
											>
												<Label
													content={({ viewBox }) => {
														if (viewBox && "cx" in viewBox && "cy" in viewBox) {
															return (
																<text
																	x={viewBox.cx}
																	y={viewBox.cy}
																	textAnchor="middle"
																	dominantBaseline="middle"
																>
																	<tspan
																		x={viewBox.cx}
																		y={viewBox.cy}
																		className="fill-foreground text-2xl font-bold"
																	>
																		{active.length}
																	</tspan>
																	<tspan
																		x={viewBox.cx}
																		y={(viewBox.cy || 0) + 24}
																		className="fill-muted-foreground text-sm"
																	>
																		Total Subs
																	</tspan>
																</text>
															);
														}
													}}
												/>
											</Pie>
										</PieChart>
									</ChartContainer>
								</div>

								{/* Category List */}
								<div className="w-full flex-1 space-y-3">
									{categoryData.slice(0, 5).map((category) => (
										<div
											key={category.name}
											className="flex items-center justify-between"
										>
											<div className="flex items-center gap-2">
												<div
													className="h-3 w-3 rounded-sm"
													style={{ backgroundColor: category.fill }}
												/>
												<span className="text-sm font-normal text-muted-foreground">
													{category.name}
												</span>
											</div>
											<span className="text-sm font-semibold">
												{formatCurrency(category.amount, currency)}
											</span>
										</div>
									))}
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
