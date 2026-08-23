document.addEventListener('DOMContentLoaded', () => {
    // Add this near the top with other initialization code
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    });

    // Updated selector to include images
    document.querySelectorAll('hr, h1, h2, h3, img.fade-in').forEach(element => {
        if (element.tagName === 'HR') {
            observer.observe(element);
        } else {
            element.classList.add('fade-in');
            observer.observe(element);
        }
    });

    // Mobile nav code - only run if elements exist
    const mobileNavToggle = document.querySelector('.mobile-nav');
    const header = document.querySelector('header');
    
    if (mobileNavToggle && header) {
        mobileNavToggle.onclick = (e) => {
            const isCurrentlyActive = mobileNavToggle.classList.contains('is-active');
            if (isCurrentlyActive) {
                mobileNavToggle.classList.remove('is-active');
                header.classList.remove('is-active');
            } else {
                mobileNavToggle.classList.add('is-active');
                header.classList.add('is-active');
            }
            mobileNavToggle.setAttribute('aria-expanded', !isCurrentlyActive);
        };
    }
});
