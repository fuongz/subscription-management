import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { SubscriptionCard } from "@/components/subscription-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppTour } from "@/hooks/use-app-tour";
import {
	convertCurrency,
	formatCurrency,
	type SupportedCurrency,
} from "@/lib/currency-utils";
import { getSubscriptions } from "@/server/subscriptions";
import { getUserPreferences } from "@/server/user-preferences";

export const Route = createFileRoute("/_authed/subscriptions/")({
	loader: async () => {
		const [subscriptions, preferences] = await Promise.all([
			getSubscriptions(),
			getUserPreferences(),
		]);
		return { subscriptions, preferences };
	},
	component: SubscriptionsPage,
});

function SubscriptionsPage() {
	const { subscriptions, preferences } = Route.useLoaderData();
	useAppTour({ page: "subscriptions" });

	const [filter, setFilter] = useState("all");
	const userCurrency = (preferences.currency || "VND") as SupportedCurrency;

	// Apply both status and category filters
	const filtered = subscriptions.filter((s) => {
		const statusMatch = filter === "all" || s.status === filter;
		return statusMatch;
	});

	const active = subscriptions.filter((s) => s.status === "active");
	const monthlyTotal = active.reduce((sum, s) => {
		const converted = convertCurrency(
			s.price,
			s.currency as SupportedCurrency,
			userCurrency,
		);
		if (s.billingCycle === "monthly") return sum + converted;
		if (s.billingCycle === "yearly") return sum + converted / 12;
		if (s.billingCycle === "weekly") return sum + converted * 4.33;
		return sum;
	}, 0);

	const numberOfCancelled = subscriptions.filter(
		(s) => s.status === "cancelled",
	).length;
	const numberOfPaused = subscriptions.filter(
		(s) => s.status === "paused",
	).length;
	const numberOfActive = subscriptions.filter(
		(s) => s.status === "active",
	).length;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div data-tour="subscriptions-header">
					<h1 className="text-2xl font-bold font-serif">Subscriptions</h1>
					{active.length > 0 && (
						<p className="text-sm text-muted-foreground mt-1">
							{formatCurrency(monthlyTotal, userCurrency)}/mo across{" "}
							{active.length} active
						</p>
					)}
				</div>
				<Link to="/subscriptions/new">
					<Button data-tour="add-subscription-btn">
						<Plus className="mr-2 h-4 w-4" />
						Add Subscription
					</Button>
				</Link>
			</div>

			<Tabs value={filter} onValueChange={setFilter}>
				<TabsList data-tour="subscription-tabs">
					<TabsTrigger value="all">
						All
						<Badge className="text-[10px] ml-1 p-0 size-4 rounded-full">
							{subscriptions.length}
						</Badge>
					</TabsTrigger>
					<TabsTrigger value="active">
						Active
						{numberOfActive > 0 && (
							<Badge className="text-[10px] ml-1 p-0 size-4 rounded-full">
								{numberOfActive}
							</Badge>
						)}
					</TabsTrigger>
					<TabsTrigger value="paused">
						Paused
						{numberOfPaused > 0 && (
							<Badge className="text-[10px] ml-1 p-0 size-4 rounded-full">
								{numberOfPaused}
							</Badge>
						)}
					</TabsTrigger>
					<TabsTrigger value="cancelled">
						Cancelled
						{numberOfCancelled > 0 && (
							<Badge className="text-[10px] ml-1 p-0 size-4 rounded-full">
								{numberOfCancelled}
							</Badge>
						)}
					</TabsTrigger>
				</TabsList>
				<TabsContent value={filter}>
					{filtered.length === 0 ? (
						<div className="py-12 text-center text-muted-foreground">
							<p>No subscriptions found.</p>
							<Link
								to="/subscriptions/new"
								className="mt-2 inline-block text-primary underline"
							>
								Add your first subscription
							</Link>
						</div>
					) : (
						<div
							className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
							data-tour="subscription-grid"
						>
							{filtered.map((sub) => (
								<SubscriptionCard key={sub.id} sub={sub} />
							))}
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
