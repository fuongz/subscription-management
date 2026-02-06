import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/login")({
	component: LoginPage,
});

function getFieldError(field: {
	state: {
		meta: { isTouched: boolean; errors: unknown[] };
	};
}) {
	if (!field.state.meta.isTouched || field.state.meta.errors.length === 0)
		return undefined;
	return field.state.meta.errors
		.filter(
			(e): e is string | { message: string } =>
				e !== undefined &&
				(typeof e === "string" ||
					(typeof e === "object" && e !== null && "message" in e)),
		)
		.map((e) => (typeof e === "string" ? e : e.message))
		.join(", ");
}

function LoginPage() {
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const form = useForm({
		defaultValues: {
			email: "",
		},
		onSubmit: async ({ value }) => {
			setError("");
			setSuccess("");

			try {
				const result = await authClient.signIn.magicLink({
					email: value.email,
					callbackURL: "/dashboard",
				});
				if (result.error) {
					setError(result.error.message || "Failed to send magic link");
				} else {
					setSuccess("Check your email for a magic link to sign in!");
				}
			} catch {
				setError("Something went wrong");
			}
		},
	});

	return (
		<div className="flex min-h-screen bg-muted items-center justify-center">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Sign In</CardTitle>
					<CardDescription>
						Enter your email to receive a magic link to sign in.
					</CardDescription>
				</CardHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
				>
					<CardContent className="space-y-4">
						{error && (
							<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
								{error}
							</div>
						)}

						{success && (
							<div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
								{success}
							</div>
						)}

						<form.Field
							name="email"
							validators={{
								onChange: ({ value }) =>
									!value ? "Email is required" : undefined,
							}}
						>
							{(field) => {
								const fieldError = getFieldError(field);
								return (
									<Field data-invalid={fieldError ? true : undefined}>
										<FieldLabel htmlFor={field.name}>Email</FieldLabel>
										<InputGroup>
											<InputGroupAddon align="inline-start">
												<InputGroupText>
													<Mail />
												</InputGroupText>
											</InputGroupAddon>
											<InputGroupInput
												id={field.name}
												type="email"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="you@example.com"
												aria-invalid={fieldError ? true : undefined}
											/>
										</InputGroup>
										{fieldError && <FieldError>{fieldError}</FieldError>}
									</Field>
								);
							}}
						</form.Field>
					</CardContent>
					<CardFooter className="flex flex-col gap-4 mt-4">
						<form.Subscribe
							selector={(state) => [state.canSubmit, state.isSubmitting]}
						>
							{([canSubmit, isSubmitting]) => (
								<Button
									type="submit"
									className="w-full"
									disabled={!canSubmit || isSubmitting}
								>
									{isSubmitting ? "Sending magic link..." : "Send Magic Link"}
								</Button>
							)}
						</form.Subscribe>

						<div className="relative w-full">
							<div className="absolute inset-0 flex items-center">
								<Separator className="w-full" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-card px-2 text-muted-foreground">or</span>
							</div>
						</div>

						<Button
							type="button"
							variant="outline"
							className="w-full"
							onClick={() => {
								authClient.signIn.social({
									provider: "google",
									callbackURL: "/dashboard",
								});
							}}
						>
							<svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
								<path
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
									fill="#4285F4"
								/>
								<path
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									fill="#34A853"
								/>
								<path
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
									fill="#FBBC05"
								/>
								<path
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									fill="#EA4335"
								/>
							</svg>
							Continue with Google
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
