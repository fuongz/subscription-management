export function formatDate(dateStr: string | null): string {
	if (!dateStr) return "";
	const date = new Date(`${dateStr}T00:00:00`);
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export function daysUntil(dateStr: string | null): number {
	if (!dateStr) return 0;
	const target = new Date(`${dateStr}T00:00:00`);
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const diff = target.getTime() - today.getTime();
	return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
