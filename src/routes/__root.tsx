import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
	useRouterState,
} from "@tanstack/react-router";
import { Nav } from "@/components/nav";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "SubTracker - Subscription Management" },
			{
				httpEquiv: "Content-Security-Policy",
				content: [
					"default-src 'self'",
					"script-src 'self' 'unsafe-inline'",
					"style-src 'self' 'unsafe-inline'",
					"img-src 'self' data: https:",
					"font-src 'self'",
					"connect-src 'self' https://accounts.google.com",
					"frame-src https://accounts.google.com",
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
	const isLanding = pathname === "/";

	if (isLanding) {
		return <Outlet />;
	}

	return (
		<>
			<Nav />
			<main className="mx-auto max-w-5xl px-4 py-6">
				<Outlet />
			</main>
		</>
	);
}
