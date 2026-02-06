import { type DriveStep, driver } from "driver.js";
import { useCallback, useEffect, useRef } from "react";
import "driver.js/dist/driver.css";

const TOUR_STORAGE_KEY = "phakesub-tour-completed";

const dashboardSteps: {
	[key: string]: DriveStep[];
} = {
	dashboard: [
		{
			popover: {
				title: "Welcome to Phake Subscription!",
				description:
					"Let us give you a quick tour of the app. You can always replay this tour from Settings.",
			},
		},
		{
			element: '[data-tour="sidebar-nav"]',
			popover: {
				title: "Navigation",
				description:
					"Use the sidebar to navigate between Dashboard, Subscriptions, and Settings.",
				side: "right",
				align: "start",
			},
		},
		{
			element: '[data-tour="stats-cards"]',
			popover: {
				title: "Spending Overview",
				description:
					"See your monthly and yearly spending at a glance, along with active subscription count and upcoming renewals.",
				side: "bottom",
				align: "center",
			},
		},
		{
			element: '[data-tour="upcoming-renewals"]',
			popover: {
				title: "Upcoming Renewals",
				description:
					"Track which subscriptions are renewing soon. Items within 3 days are highlighted in red.",
				side: "top",
				align: "center",
			},
		},
		{
			element: '[data-tour="category-breakdown"]',
			popover: {
				title: "Spending by Category",
				description:
					"Visualize how your spending is distributed across categories like Entertainment, Development, and more.",
				side: "top",
				align: "center",
			},
		},
		{
			element: '[data-tour="sidebar-user"]',
			popover: {
				title: "Your Account",
				description:
					"Click here to access your profile and sign out. You're all set — enjoy managing your subscriptions!",
				side: "right",
				align: "end",
			},
		},
	],
};

export function useAppTour({ page }: { page?: string }) {
	const driverRef = useRef<ReturnType<typeof driver> | null>(null);
	const startTour = useCallback(() => {
		if (page === undefined || typeof dashboardSteps[page] === "undefined") {
			return;
		}
		const steps = dashboardSteps[page];
		// Small delay to ensure DOM elements are rendered
		setTimeout(() => {
			const driverObj = driver({
				showProgress: true,
				animate: true,
				smoothScroll: true,
				allowClose: true,
				overlayClickBehavior: "nextStep",
				stagePadding: 8,
				stageRadius: 8,
				popoverOffset: 12,
				showButtons: ["next", "previous", "close"],
				nextBtnText: "Next",
				popoverClass: "phake-tour-popover",
				prevBtnText: "Back",
				doneBtnText: "Done",
				progressText: "{{current}} / {{total}}",
				steps,
				onDestroyed: () => {
					localStorage.setItem(`${TOUR_STORAGE_KEY}_${page}`, "true");
				},
			});
			driverRef.current = driverObj;
			driverObj.drive();
		}, 500);
	}, [page]);

	const hasCompletedTour = useCallback(() => {
		return localStorage.getItem(`${TOUR_STORAGE_KEY}_${page}`) === "true";
	}, [page]);

	const resetTour = useCallback(() => {
		localStorage.removeItem(`${TOUR_STORAGE_KEY}_${page}`);
	}, [page]);

	// Auto-start on first visit
	useEffect(() => {
		if (!hasCompletedTour()) {
			startTour();
		}
		return () => {
			driverRef.current?.destroy();
		};
	}, [hasCompletedTour, startTour]);

	return { startTour, resetTour, hasCompletedTour };
}
