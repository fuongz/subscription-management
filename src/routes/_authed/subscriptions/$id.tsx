import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useState } from "react";
import { SubscriptionForm } from "@/components/subscription-form";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	deleteSubscription,
	getSubscription,
	updateSubscription,
} from "@/server/subscriptions";

export const Route = createFileRoute("/_authed/subscriptions/$id")({
	loader: ({ params }) => getSubscription({ data: params.id }),
	component: EditSubscriptionPage,
});

function EditSubscriptionPage() {
	const sub = Route.useLoaderData();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const { id } = Route.useParams();

	if (!sub) {
		return (
			<div className="py-12 text-center text-muted-foreground">
				Subscription not found.
			</div>
		);
	}

	// If the subscription has both provider and planName, it was created from a template
	const isTemplate = !!(sub.provider && sub.planName);

	const handleDelete = async () => {
		setDeleting(true);
		try {
			await deleteSubscription({ data: id });
			navigate({ to: "/subscriptions" });
		} finally {
			setDeleting(false);
		}
	};

	return (
		<div className="mx-auto">
			<div className="mb-4 flex justify-between items-center">
				<Button
					variant="ghost"
					onClick={() => navigate({ to: "/subscriptions" })}
				>
					<ArrowLeft /> Go Back
				</Button>
				<h3 className="font-serif font-bold text-2xl">Edit Subscription</h3>
				<AlertDialog>
					<AlertDialogTrigger
						render={
							<Button variant="destructive" size="sm" className="border-none" />
						}
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Delete
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete Subscription</AlertDialogTitle>
							<AlertDialogDescription>
								Are you sure you want to delete "{sub.name}"? This action cannot
								be undone.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel render={<Button variant="outline" />}>
								Cancel
							</AlertDialogCancel>
							<Button
								variant="destructive"
								className="border-none"
								onClick={handleDelete}
								disabled={deleting}
							>
								{deleting ? "Deleting..." : "Delete"}
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>

			<SubscriptionForm
				defaultValues={{
					name: sub.name,
					provider: sub.provider || undefined,
					planName: sub.planName || undefined,
					price: sub.price,
					currency: sub.currency,
					billingCycle: sub.billingCycle,
					startDate: sub.startDate,
					nextBillingDate: sub.nextBillingDate || undefined,
					status: sub.status,
					category: sub.category || undefined,
					notes: sub.notes || undefined,
				}}
				isTemplate={isTemplate}
				isLoading={loading}
				submitLabel="Update Subscription"
				onSubmit={async (data) => {
					setLoading(true);
					try {
						await updateSubscription({ data: { ...data, id } });
						navigate({ to: "/subscriptions" });
					} finally {
						setLoading(false);
					}
				}}
			/>
		</div>
	);
}
