import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
	useRouterState,
} from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { PageLoading } from "@/components/page-loading";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import appCss from "../styles.css?url";

const PUBLIC_PATHS = ["/", "/login", "/register"];

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "Phake Subscription - Subscription Management" },
			{
				httpEquiv: "Content-Security-Policy",
				content: [
					"default-src 'self'",
					"script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
					"style-src 'self' 'unsafe-inline'",
					"img-src 'self' data: https:",
					"font-src 'self'",
					"connect-src 'self' https://accounts.google.com https://challenges.cloudflare.com",
					"frame-src https://accounts.google.com https://challenges.cloudflare.com",
					"object-src 'none'",
					"base-uri 'self'",
					"form-action 'self' https://accounts.google.com",
				].join("; "),
			},
			{ httpEquiv: "X-Content-Type-Options", content: "nosniff" },
			{
				httpEquiv: "Referrer-Policy",
				content: "strict-origin-when-cross-origin",
			},
		],
		links: [{ rel: "stylesheet", href: appCss }],
	}),
	component: RootComponent,
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}

function RootComponent() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const isPublic = PUBLIC_PATHS.includes(pathname);

	if (isPublic) {
		return <Outlet />;
	}

	return (
		<SidebarProvider>
			<PageLoading />
			<AppSidebar />
			<SidebarInset>
				<header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
					<SidebarTrigger className="-ml-1" />
					<span className="text-sm font-medium text-muted-foreground">
						Phake Subscription
					</span>
				</header>
				<main className="flex-1 px-6 py-6">
					<Outlet />
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
