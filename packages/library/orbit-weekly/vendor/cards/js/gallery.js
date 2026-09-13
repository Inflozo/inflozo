/* Vendored verbatim from Ghost 6.58.0, core/frontend/src/cards/js/gallery.js, by `python3 tools/probe/record-cards.py`.
   Copyright (c) 2013-2026 Ghost Foundation. MIT licence — the full text is vendor/LICENSE-ghost.txt. */
(function() {
    const images = document.querySelectorAll('.kg-gallery-image img');
    images.forEach(function (image) {
        const container = image.closest('.kg-gallery-image');
        const width = image.attributes.width.value;
        const height = image.attributes.height.value;
        const ratio = width / height;
        container.style.flex = ratio + ' 1 0%';
    })
})();
