import { useForm, useStore } from "@tanstack/react-form";
import {
	Building2,
	CalendarClock,
	CalendarDays,
	CreditCard,
	DollarSign,
	FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
	InputGroupTextarea,
} from "@/components/ui/input-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { CreateSubscriptionInput } from "@/server/subscriptions";

const CATEGORIES = [
	"Entertainment",
	"Music",
	"Productivity",
	"Cloud Storage",
	"Development",
	"Domain",
	"Education",
	"Health & Fitness",
	"News",
	"Other",
];

type EditableFields =
	| "name"
	| "provider"
	| "planName"
	| "price"
	| "billingCycle"
	| "category";

interface SubscriptionFormProps {
	defaultValues?: Partial<CreateSubscriptionInput>;
	onSubmit: (data: CreateSubscriptionInput) => void;
	isLoading?: boolean;
	submitLabel?: string;
	isTemplate?: boolean;
	/** Fields that remain editable even when isTemplate is true */
	editableFields?: Array<EditableFields>;
}

function computeNextBillingDate(
	startDate: string,
	billingCycle: string,
): string {
	if (!startDate) return "";
	const start = new Date(`${startDate}T00:00:00`);
	if (Number.isNaN(start.getTime())) return "";

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const next = new Date(start);
	while (next < today) {
		if (billingCycle === "weekly") {
			next.setDate(next.getDate() + 7);
		} else if (billingCycle === "monthly") {
			next.setMonth(next.getMonth() + 1);
		} else if (billingCycle === "yearly") {
			next.setFullYear(next.getFullYear() + 1);
		}
	}

	return next.toISOString().split("T")[0];
}

function getFieldError(field: {
	state: {
		meta: {
			isTouched: boolean;
			errors: Array<string | { message: string } | undefined>;
		};
	};
}) {
	if (!field.state.meta.isTouched || field.state.meta.errors.length === 0)
		return undefined;
	return field.state.meta.errors
		.filter((e): e is string | { message: string } => e !== undefined)
		.map((e) => (typeof e === "string" ? e : e.message))
		.join(", ");
}

export function SubscriptionForm({
	defaultValues,
	onSubmit,
	isLoading,
	submitLabel = "Save",
	isTemplate = false,
	editableFields,
}: SubscriptionFormProps) {
	const isFieldDisabled = (field: string) =>
		isTemplate && !editableFields?.includes(field as EditableFields);

	const form = useForm({
		defaultValues: {
			name: defaultValues?.name || "",
			provider: defaultValues?.provider || "",
			planName: defaultValues?.planName || "",
			price: defaultValues?.price?.toString() || "",
			currency: defaultValues?.currency || "VND",
			billingCycle: (defaultValues?.billingCycle || "monthly") as
				| "monthly"
				| "yearly"
				| "weekly",
			startDate: defaultValues?.startDate || "",
			status: (defaultValues?.status || "active") as
				| "active"
				| "paused"
				| "cancelled",
			category: defaultValues?.category || "",
			notes: defaultValues?.notes || "",
		},
		onSubmit: async ({ value }) => {
			const nextBillingDate = computeNextBillingDate(
				value.startDate,
				value.billingCycle,
			);
			onSubmit({
				name: value.name,
				provider: value.provider || undefined,
				planName: value.planName || undefined,
				price: parseFloat(value.price),
				currency: value.currency,
				billingCycle: value.billingCycle,
				startDate: value.startDate,
				nextBillingDate: nextBillingDate || value.startDate || undefined,
				status: value.status,
				category: value.category || undefined,
				notes: value.notes || undefined,
			});
		},
	});

	// Watch startDate and billingCycle for auto-calculated next billing date display
	const startDate = useStore(form.store, (s) => s.values.startDate);
	const billingCycle = useStore(form.store, (s) => s.values.billingCycle);
	const nextBillingDate = computeNextBillingDate(startDate, billingCycle);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-4"
		>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				{/* Name */}
				<form.Field
					name="name"
					validators={{
						onChange: ({ value }) =>
							!value ? "Service name is required" : undefined,
					}}
				>
					{(field) => {
						const error = getFieldError(field);
						return (
							<Field
								data-invalid={error ? true : undefined}
								data-disabled={isFieldDisabled("name") || undefined}
							>
								<FieldLabel htmlFor={field.name}>Service Name *</FieldLabel>
								<InputGroup
									data-disabled={isFieldDisabled("name") || undefined}
								>
									<InputGroupAddon align="inline-start">
										<InputGroupText>
											<CreditCard />
										</InputGroupText>
									</InputGroupAddon>
									<InputGroupInput
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Netflix"
										disabled={isFieldDisabled("name")}
										aria-invalid={error ? true : undefined}
									/>
								</InputGroup>
								{error && <FieldError>{error}</FieldError>}
							</Field>
						);
					}}
				</form.Field>

				{/* Provider */}
				<form.Field name="provider">
					{(field) => (
						<Field data-disabled={isFieldDisabled("provider") || undefined}>
							<FieldLabel htmlFor={field.name}>Provider</FieldLabel>
							<InputGroup
								data-disabled={isFieldDisabled("provider") || undefined}
							>
								<InputGroupAddon align="inline-start">
									<InputGroupText>
										<Building2 />
									</InputGroupText>
								</InputGroupAddon>
								<InputGroupInput
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Netflix Inc."
									disabled={isFieldDisabled("provider")}
								/>
							</InputGroup>
						</Field>
					)}
				</form.Field>

				{/* Plan Name */}
				<form.Field name="planName">
					{(field) => (
						<Field data-disabled={isFieldDisabled("planName") || undefined}>
							<FieldLabel htmlFor={field.name}>Plan Name</FieldLabel>
							<InputGroup
								data-disabled={isFieldDisabled("planName") || undefined}
							>
								<InputGroupAddon align="inline-start">
									<InputGroupText>
										<FileText />
									</InputGroupText>
								</InputGroupAddon>
								<InputGroupInput
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Premium"
									disabled={isFieldDisabled("planName")}
								/>
							</InputGroup>
						</Field>
					)}
				</form.Field>

				{/* Price */}
				<form.Field
					name="price"
					validators={{
						onChange: ({ value }) =>
							!value
								? "Price is required"
								: Number.isNaN(parseFloat(value))
									? "Must be a valid number"
									: parseFloat(value) < 0
										? "Price cannot be negative"
										: undefined,
					}}
				>
					{(field) => {
						const error = getFieldError(field);
						return (
							<Field
								data-invalid={error ? true : undefined}
								data-disabled={isFieldDisabled("price") || undefined}
							>
								<FieldLabel htmlFor={field.name}>Price *</FieldLabel>
								<InputGroup
									data-disabled={isFieldDisabled("price") || undefined}
								>
									<InputGroupAddon align="inline-start">
										<InputGroupText>
											<DollarSign />
										</InputGroupText>
									</InputGroupAddon>
									<InputGroupInput
										id={field.name}
										type="number"
										step="0.01"
										min="0"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="9.99"
										disabled={isFieldDisabled("price")}
										aria-invalid={error ? true : undefined}
									/>
								</InputGroup>
								{error && <FieldError>{error}</FieldError>}
							</Field>
						);
					}}
				</form.Field>

				{/* Currency */}
				<form.Field name="currency">
					{(field) => (
						<Field>
							<FieldLabel htmlFor={field.name}>Currency</FieldLabel>
							<Select
								value={field.state.value}
								onValueChange={(v) => field.handleChange(v ?? "")}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="VND">VND — Vietnamese Dong</SelectItem>
									<SelectItem value="USD">USD — US Dollar</SelectItem>
								</SelectContent>
							</Select>
						</Field>
					)}
				</form.Field>

				{/* Billing Cycle */}
				<form.Field name="billingCycle">
					{(field) => (
						<Field data-disabled={isFieldDisabled("billingCycle") || undefined}>
							<FieldLabel htmlFor={field.name}>Billing Cycle</FieldLabel>
							<Select
								value={field.state.value}
								onValueChange={(v) =>
									field.handleChange(
										(v ?? "monthly") as typeof field.state.value,
									)
								}
								disabled={isFieldDisabled("billingCycle")}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="weekly">Weekly</SelectItem>
									<SelectItem value="monthly">Monthly</SelectItem>
									<SelectItem value="yearly">Yearly</SelectItem>
								</SelectContent>
							</Select>
						</Field>
					)}
				</form.Field>

				{/* Start Date */}
				<form.Field
					name="startDate"
					validators={{
						onChange: ({ value }) =>
							!value ? "Start date is required" : undefined,
					}}
				>
					{(field) => {
						const error = getFieldError(field);
						return (
							<Field data-invalid={error ? true : undefined}>
								<FieldLabel htmlFor={field.name}>Start Date *</FieldLabel>
								<InputGroup>
									<InputGroupAddon align="inline-start">
										<InputGroupText>
											<CalendarDays />
										</InputGroupText>
									</InputGroupAddon>
									<InputGroupInput
										id={field.name}
										type="date"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={error ? true : undefined}
									/>
								</InputGroup>
								{error && <FieldError>{error}</FieldError>}
							</Field>
						);
					}}
				</form.Field>

				{/* Next Billing Date (auto-calculated, read-only) */}
				<Field data-disabled="true">
					<FieldLabel htmlFor="nextBillingDate">Next Billing Date</FieldLabel>
					<InputGroup data-disabled="true">
						<InputGroupAddon align="inline-start">
							<InputGroupText>
								<CalendarClock />
							</InputGroupText>
						</InputGroupAddon>
						<InputGroupInput
							id="nextBillingDate"
							type="date"
							value={nextBillingDate}
							disabled
							className="bg-muted"
						/>
					</InputGroup>
					{startDate && (
						<FieldDescription>
							Auto-calculated from start date & billing cycle
						</FieldDescription>
					)}
				</Field>

				{/* Status */}
				<form.Field name="status">
					{(field) => (
						<Field>
							<FieldLabel htmlFor={field.name}>Status</FieldLabel>
							<Select
								value={field.state.value}
								onValueChange={(v) =>
									field.handleChange(
										(v ?? "active") as typeof field.state.value,
									)
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="paused">Paused</SelectItem>
									<SelectItem value="cancelled">Cancelled</SelectItem>
								</SelectContent>
							</Select>
						</Field>
					)}
				</form.Field>

				{/* Category */}
				<form.Field name="category">
					{(field) => (
						<Field data-disabled={isFieldDisabled("category") || undefined}>
							<FieldLabel htmlFor={field.name}>Category</FieldLabel>
							<Select
								value={field.state.value}
								onValueChange={(v) => field.handleChange(v ?? "")}
								disabled={isFieldDisabled("category")}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select category" />
								</SelectTrigger>
								<SelectContent>
									{CATEGORIES.map((cat) => (
										<SelectItem key={cat} value={cat}>
											{cat}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>
					)}
				</form.Field>
			</div>

			{/* Notes */}
			<form.Field name="notes">
				{(field) => (
					<Field>
						<FieldLabel htmlFor={field.name}>Notes</FieldLabel>
						<InputGroup>
							<InputGroupTextarea
								id={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="Any notes about this subscription..."
								autoComplete="off"
								className="h-24"
							/>
						</InputGroup>
					</Field>
				)}
			</form.Field>

			<form.Subscribe
				selector={(state) => [state.canSubmit, state.isSubmitting]}
			>
				{([canSubmit, isSubmitting]) => (
					<Button
						type="submit"
						size="lg"
						disabled={!canSubmit || isLoading || isSubmitting}
					>
						{isLoading || isSubmitting ? "Saving..." : submitLabel}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
