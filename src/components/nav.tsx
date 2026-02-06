import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function Nav() {
	const { data: session } = authClient.useSession();
	const navigate = useNavigate();

	const handleSignOut = async () => {
		await authClient.signOut();
		navigate({ to: "/" });
	};

	return (
		<nav className="border-b bg-background">
			<div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
				<Link to="/" className="flex items-center gap-2 font-semibold">
					Subscription Management
				</Link>

				<div className="flex items-center gap-4">
					{session?.user ? (
						<>
							<Link
								to="/dashboard"
								className="text-sm text-muted-foreground hover:text-foreground"
							>
								Dashboard
							</Link>
							<Link
								to="/subscriptions"
								className="text-sm text-muted-foreground hover:text-foreground"
							>
								Subscriptions
							</Link>
							<span className="text-sm text-muted-foreground">
								{session.user.name}
							</span>
							<Button variant="ghost" size="icon" onClick={handleSignOut}>
								<LogOut className="h-4 w-4" />
							</Button>
						</>
					) : (
						<>
							<Link to="/login">
								<Button variant="ghost" size="sm">
									Sign in
								</Button>
							</Link>
							<Link to="/register">
								<Button size="sm">Sign up</Button>
							</Link>
						</>
					)}
				</div>
			</div>
		</nav>
	);
}
