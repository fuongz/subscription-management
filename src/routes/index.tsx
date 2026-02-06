import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowRight,
	CalendarClock,
	CreditCard,
	TrendingUp,
} from "lucide-react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/")({ component: LandingPage });

// Spring configs
const gentle = {
	type: "spring" as const,
	stiffness: 100,
	damping: 20,
	mass: 1,
};
const snappy = {
	type: "spring" as const,
	stiffness: 200,
	damping: 25,
	mass: 0.8,
};
const soft = { type: "spring" as const, stiffness: 80, damping: 20, mass: 1.2 };

function LandingPage() {
	const { data: session } = authClient.useSession();

	return (
		<div className="min-h-screen bg-[#F6FAF6] overflow-x-hidden">
			{/* Nav */}
			<motion.header
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ ...gentle, delay: 0.1 }}
				className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5"
			>
				<span className="text-lg font-semibold tracking-tight text-[#1A3A2A]">
					Subscription Management
				</span>
				<nav className="hidden items-center gap-8 sm:flex">
					<a
						href="#features"
						className="text-sm text-[#5A7A6A] transition-colors hover:text-[#1A3A2A]"
					>
						Features
					</a>
					<a
						href="#how-it-works"
						className="text-sm text-[#5A7A6A] transition-colors hover:text-[#1A3A2A]"
					>
						How it works
					</a>
				</nav>
				<div>
					{session?.user ? (
						<Link
							to="/dashboard"
							className="inline-flex items-center rounded-full bg-[#2D6A4F] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1B4332]"
						>
							Dashboard
						</Link>
					) : (
						<Link
							to="/register"
							className="inline-flex items-center rounded-full bg-[#2D6A4F] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1B4332]"
						>
							Begin your journey
						</Link>
					)}
				</div>
			</motion.header>

			{/* Hero */}
			<section className="mx-auto flex max-w-4xl flex-col items-center px-6 pt-24 pb-32 text-center">
				{/* Badge */}
				<motion.div
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ ...snappy, delay: 0.3 }}
					className="mb-10 inline-flex items-center gap-2 rounded-full border border-[#B7DEBF] bg-[#E8F5E9] px-4 py-1.5"
				>
					<motion.span
						animate={{ scale: [1, 1.3, 1] }}
						transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
						className="h-2 w-2 rounded-full bg-[#40916C]"
					/>
					<span className="text-sm text-[#2D6A4F]">
						Stop overpaying for forgotten subscriptions
					</span>
				</motion.div>

				{/* Headline */}
				<motion.h1
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ ...soft, delay: 0.5 }}
					className="max-w-3xl font-serif text-5xl font-bold leading-tight tracking-tight text-[#1A3A2A] sm:text-6xl md:text-7xl"
				>
					Take control of <em className="text-[#40916C]">recurring costs</em>
				</motion.h1>

				{/* Subtitle */}
				<motion.p
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ ...gentle, delay: 0.7 }}
					className="mt-6 max-w-xl text-lg leading-relaxed text-[#6B8F7B]"
				>
					Know exactly where your money goes each month. Subscription Management
					helps you track every subscription, spot forgotten charges, and make
					smarter spending decisions.
				</motion.p>

				{/* CTAs */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ ...gentle, delay: 0.9 }}
					className="mt-10 flex items-center gap-6"
				>
					<motion.div
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.97 }}
						transition={snappy}
					>
						<Link
							to="/register"
							className="inline-flex items-center gap-2 rounded-full bg-[#2D6A4F] px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#1B4332]"
						>
							Start for free
							<ArrowRight className="h-4 w-4" />
						</Link>
					</motion.div>
					<Link
						to="/login"
						className="relative text-sm font-medium text-[#5A7A6A] transition-colors hover:text-[#1A3A2A]"
					>
						<span className="border-l border-[#C8D8D0] pl-6">Sign in</span>
					</Link>
				</motion.div>
			</section>

			{/* Features */}
			<ScrollSection
				id="features"
				className="border-t border-[#D4E8D8] bg-[#EDF5EE] py-24"
			>
				<div className="mx-auto max-w-5xl px-6">
					<motion.div variants={fadeUp} className="mb-16 text-center">
						<h2 className="font-serif text-3xl font-bold text-[#1A3A2A] sm:text-4xl">
							Everything you need, nothing you don't
						</h2>
						<p className="mt-4 text-[#6B8F7B]">
							Simple tools to stay on top of every recurring payment.
						</p>
					</motion.div>

					<div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
						<FeatureCard
							icon={<CreditCard className="h-5 w-5" />}
							title="Smart Tracking"
							description="Add subscriptions from popular templates or create custom entries. Every detail, captured effortlessly."
							index={0}
						/>
						<FeatureCard
							icon={<CalendarClock className="h-5 w-5" />}
							title="Auto Renewals"
							description="Next billing dates are calculated automatically from your start date and billing cycle. Never miss a renewal."
							index={1}
						/>
						<FeatureCard
							icon={<TrendingUp className="h-5 w-5" />}
							title="Budget Insights"
							description="See your monthly and yearly spend at a glance. Understand where your money goes with clear breakdowns."
							index={2}
						/>
					</div>
				</div>
			</ScrollSection>

			{/* How it works */}
			<ScrollSection id="how-it-works" className="bg-[#F6FAF6] py-24">
				<div className="mx-auto max-w-3xl px-6 text-center">
					<motion.div variants={fadeUp}>
						<h2 className="font-serif text-3xl font-bold text-[#1A3A2A] sm:text-4xl">
							Three steps to clarity
						</h2>
						<p className="mt-4 text-[#6B8F7B]">
							Getting started takes less than a minute.
						</p>
					</motion.div>

					<div className="mt-16 grid grid-cols-1 gap-12 sm:grid-cols-3">
						<Step
							number="1"
							title="Sign up"
							description="Create your free account in seconds."
							index={0}
						/>
						<Step
							number="2"
							title="Add subscriptions"
							description="Pick from templates or add your own services."
							index={1}
						/>
						<Step
							number="3"
							title="Stay informed"
							description="Track spend, renewals, and trends from your dashboard."
							index={2}
						/>
					</div>
				</div>
			</ScrollSection>

			{/* Footer CTA */}
			<ScrollSection className="border-t border-[#D4E8D8] bg-[#EDF5EE] py-20">
				<div className="mx-auto max-w-2xl px-6 text-center">
					<motion.div variants={fadeUp}>
						<h2 className="font-serif text-2xl font-bold text-[#1A3A2A] sm:text-3xl">
							Stop guessing, start tracking
						</h2>
						<p className="mt-3 text-[#6B8F7B]">
							Join and take control of your recurring costs today. It's free.
						</p>
					</motion.div>
					<motion.div variants={fadeUp} className="mt-8">
						<motion.div
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.97 }}
							transition={snappy}
							className="inline-block"
						>
							<Link
								to="/register"
								className="inline-flex items-center gap-2 rounded-full bg-[#2D6A4F] px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#1B4332]"
							>
								Get started
								<ArrowRight className="h-4 w-4" />
							</Link>
						</motion.div>
					</motion.div>
				</div>
			</ScrollSection>

			{/* Footer */}
			<footer className="border-t border-[#D4E8D8] bg-[#F6FAF6] py-8">
				<div className="mx-auto max-w-5xl px-6 text-center text-sm text-[#8BA898]">
					© {new Date().getFullYear()}{" "}
					<a
						href="http://phuongphung.com"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:underline"
					>
						fuongz
					</a>
					. Built with care and love.
				</div>
			</footer>
		</div>
	);
}

// ─── Animation variants ─────────────────────────────────────────

const fadeUp = {
	hidden: { opacity: 0, y: 30 },
	visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.15,
		},
	},
};

// ─── Scroll-triggered section ───────────────────────────────────

function ScrollSection({
	children,
	className,
	id,
}: {
	children: React.ReactNode;
	className?: string;
	id?: string;
}) {
	const ref = useRef<HTMLElement>(null);
	const isInView = useInView(ref, { once: true, margin: "-80px" });

	return (
		<motion.section
			ref={ref}
			id={id}
			initial="hidden"
			animate={isInView ? "visible" : "hidden"}
			variants={staggerContainer}
			transition={gentle}
			className={className}
		>
			{children}
		</motion.section>
	);
}

// ─── Feature card with hover spring ─────────────────────────────

function FeatureCard({
	icon,
	title,
	description,
	index,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
	index: number;
}) {
	return (
		<motion.div
			variants={{
				hidden: { opacity: 0, y: 40 },
				visible: {
					opacity: 1,
					y: 0,
					transition: { ...gentle, delay: index * 0.1 },
				},
			}}
			whileHover={{ y: -6, transition: snappy }}
			className="rounded-2xl bg-[#F6FAF6] p-8 cursor-default"
		>
			<motion.div
				whileHover={{ rotate: [0, -10, 10, 0] }}
				transition={{ duration: 0.5 }}
				className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4E8D8] text-[#2D6A4F]"
			>
				{icon}
			</motion.div>
			<h3 className="mb-2 text-lg font-semibold text-[#1A3A2A]">{title}</h3>
			<p className="text-sm leading-relaxed text-[#6B8F7B]">{description}</p>
		</motion.div>
	);
}

// ─── Step with spring entrance ──────────────────────────────────

function Step({
	number,
	title,
	description,
	index,
}: {
	number: string;
	title: string;
	description: string;
	index: number;
}) {
	return (
		<motion.div
			variants={{
				hidden: { opacity: 0, y: 30, scale: 0.95 },
				visible: {
					opacity: 1,
					y: 0,
					scale: 1,
					transition: { ...gentle, delay: index * 0.15 },
				},
			}}
		>
			<motion.div
				whileHover={{ scale: 1.15 }}
				transition={snappy}
				className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#D4E8D8] text-sm font-bold text-[#1B4332]"
			>
				{number}
			</motion.div>
			<h3 className="mb-1 font-semibold text-[#1A3A2A]">{title}</h3>
			<p className="text-sm text-[#6B8F7B]">{description}</p>
		</motion.div>
	);
}
