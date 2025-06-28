export function getProductId(url: string): string | null {
    try {
        const match = url.match(/(?<=-p-)([0-9A-Fa-f-]+)(?=\.html)/);
        return match ? match[0] : null;
    } catch (e) {
        return null;
    }
}
