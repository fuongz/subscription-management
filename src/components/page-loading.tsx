import { useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Spinner } from "./ui/spinner";

export function PageLoading() {
	const [mounted, setMounted] = useState(false);
	const isLoading = useRouterState({ select: (s) => s.status === "pending" });

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted || !isLoading) return null;
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.2 }}
			className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm"
		>
			<motion.div
				initial={{ scale: 0.8 }}
				animate={{ scale: 1 }}
				exit={{ scale: 0.8 }}
				transition={{ duration: 0.2 }}
			>
				<Spinner className="size-6 stroke-primary" />
			</motion.div>
		</motion.div>
	);
}
