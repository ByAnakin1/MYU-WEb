document.addEventListener('DOMContentLoaded', () => {
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.getElementById('mainImage');

    if (thumbnails && mainImage) {
        thumbnails.forEach((thumbnail) => {
            thumbnail.addEventListener('click', (event) => {
                const target = event.target;
                if (target instanceof HTMLImageElement) {
                    mainImage.src = target.src;
                }
            });
        });
    }
});
