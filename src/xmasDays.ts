export function xMasDays(){
    const daysXmas = document.getElementById('daysXmas') as HTMLParagraphElement;
    if (!daysXmas) return;

    const today = new Date();
    const currentYear = today.getFullYear();
    const xmasDate = new Date(currentYear, 11, 25); // December is month 11

    // If today is after Christmas, calculate for next year
    if (today > xmasDate) {
        xmasDate.setFullYear(currentYear + 1);
    }

    const diffTime = xmasDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    daysXmas.innerText = `Only ${diffDays} days left until Christmas! 🎄🎅🎁`;
} 