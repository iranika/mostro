export function debounce<T extends (...args: never[]) => void>(fn: T, wait: number) {
	let timer: ReturnType<typeof setTimeout> | undefined;
	return (...args: Parameters<T>) => {
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => fn(...args), wait);
	};
}
