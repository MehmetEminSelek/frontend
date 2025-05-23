// Ortak tarih formatlama fonksiyonu
export function formatDate(dateString, includeTime = false) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Geçersiz Tarih';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        if (includeTime) {
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${day}.${month}.${year} ${hours}:${minutes}`;
        }
        return `${day}.${month}.${year}`;
    } catch (e) { return 'Hatalı Tarih'; }
} 