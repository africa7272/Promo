// Main JavaScript file for VPN Guru theme

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links with header offset
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Get header height for offset calculation
                const header = document.querySelector('.site-header');
                const headerHeight = header ? header.offsetHeight : 0;
                const additionalOffset = 20; // Extra spacing for better visibility
                
                // Calculate target position with offset
                const targetPosition = targetElement.offsetTop - headerHeight - additionalOffset;
                
                // Smooth scroll to target position
                window.scrollTo({
                    top: Math.max(0, targetPosition),
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add active class to current navigation item
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath || 
            (currentPath === '/' && link.getAttribute('href') === '/') ||
            (currentPath.startsWith('/posts') && link.getAttribute('href') === '/posts/')) {
            link.classList.add('active');
        }
    });

    // Mobile menu toggle (if needed in future)
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
        });
    }

    // Add loading animation to post cards
    const postCards = document.querySelectorAll('.post-card');
    postCards.forEach(card => {
        // basic hover transition
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
        });

        // make entire card clickable
        const href = card.getAttribute('data-href');
        if (href) {
            card.addEventListener('click', () => {
                window.location.href = href;
            });

            // keyboard accessibility
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    window.location.href = href;
                }
            });
        }
    });

    // Lazy loading for images (if needed)
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // Table of Contents active section tracking
    const tocLinks = document.querySelectorAll('.toc-container a[href^="#"]');
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    if (tocLinks.length > 0 && headings.length > 0) {
        // Calculate header height for better intersection detection
        const header = document.querySelector('.site-header');
        const headerHeight = header ? header.offsetHeight : 80;
        const rootMargin = `-${headerHeight + 20}px 0px -70% 0px`;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Remove active class from all TOC links
                    tocLinks.forEach(link => link.classList.remove('active'));
                    
                    // Add active class to current section link
                    const currentId = entry.target.id;
                    const currentLink = document.querySelector(`.toc-container a[href="#${currentId}"]`);
                    if (currentLink) {
                        currentLink.classList.add('active');
                    }
                }
            });
        }, {
            rootMargin: rootMargin
        });

        headings.forEach(heading => {
            if (heading.id) {
                observer.observe(heading);
            }
        });
    }
    
    // Table of Contents - always expanded
    const tocToggle = document.querySelector('.toc-toggle');
    const tocContent = document.querySelector('.toc-content');
    
    if (tocToggle && tocContent) {
        // TOC is always expanded on all devices
        tocContent.classList.add('expanded');
        tocToggle.classList.remove('collapsed');
        tocToggle.setAttribute('aria-expanded', 'true');
        
        // Hide the toggle button since TOC is always expanded
        tocToggle.style.display = 'none';
    }
    
    // Handle direct anchor links on page load
    function adjustScrollForAnchor() {
        const hash = window.location.hash;
        if (hash) {
            const targetElement = document.querySelector(hash);
            if (targetElement) {
                // Wait a moment for page to settle, then adjust scroll
                setTimeout(() => {
                    const header = document.querySelector('.site-header');
                    const headerHeight = header ? header.offsetHeight : 0;
                    const additionalOffset = 20;
                    
                    const targetPosition = targetElement.offsetTop - headerHeight - additionalOffset;
                    
                    window.scrollTo({
                        top: Math.max(0, targetPosition),
                        behavior: 'smooth'
                    });
                }, 100);
            }
        }
    }
    
    // Adjust scroll on page load
    adjustScrollForAnchor();
    
    // Also handle browser navigation (back/forward with hash)
    window.addEventListener('hashchange', adjustScrollForAnchor);
    
    // Handle window resize (header height might change)
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Re-adjust scroll position if we're at an anchor
            if (window.location.hash) {
                adjustScrollForAnchor();
            }
        }, 150);
    });
});
