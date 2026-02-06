import { Link } from "@tanstack/react-router";
import { BrandIcon } from "@/components/brand-icon";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getIconSlugByName } from "@/data/subscription-templates";
import type { subscription } from "@/db/schema";
import { formatCurrency, type SupportedCurrency } from "@/lib/currency-utils";
import { daysUntil, formatDate } from "@/lib/date-utils";

type Subscription = typeof subscription.$inferSelect;

const statusColors: Record<string, "default" | "secondary" | "destructive"> = {
	active: "default",
	paused: "secondary",
	cancelled: "destructive",
};

export function SubscriptionCard({ sub }: { sub: Subscription }) {
	const daysLeft = sub.nextBillingDate ? daysUntil(sub.nextBillingDate) : null;
	const iconSlug = getIconSlugByName(sub.name);
	return (
		<Link to="/subscriptions/$id" params={{ id: sub.id }}>
			<Card className="hover:bg-gradient-to-br hover:from-primary/10 hover:to-background transition hover:ring-primary/30 hover:transition">
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<div className="flex items-center gap-3">
						{iconSlug ? (
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background border border-border/40">
								<BrandIcon slug={iconSlug} className="size-6" />
							</div>
						) : (
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-base font-bold text-primary">
								{sub.name.charAt(0)}
							</div>
						)}
						<CardTitle className="text-base font-medium">{sub.name}</CardTitle>
					</div>
					<Badge variant={statusColors[sub.status]} className="capitalize">
						{sub.status}
					</Badge>
				</CardHeader>
				<CardContent>
					<div className="flex items-baseline justify-between">
						<span className="text-2xl font-bold">
							{formatCurrency(sub.price, sub.currency as SupportedCurrency)}
						</span>
						<span className="text-sm text-muted-foreground">
							/{sub.billingCycle}
						</span>
					</div>
					{sub.planName && (
						<p className="mt-1 text-sm text-muted-foreground">{sub.planName}</p>
					)}
					{sub.category && (
						<Badge variant="outline" className="mt-2">
							{sub.category}
						</Badge>
					)}
					<div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
						<span>Started {formatDate(sub.startDate)}</span>
						{daysLeft !== null && daysLeft >= 0 && (
							<span
								className={daysLeft <= 3 ? "font-medium text-destructive" : ""}
							>
								Renews in {daysLeft}d
							</span>
						)}
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
