// View Counter for Posts
document.addEventListener('DOMContentLoaded', function() {
    // Get all view count elements
    const viewCountElements = document.querySelectorAll('.view-count-number');
    
    viewCountElements.forEach(function(element) {
        const postId = element.getAttribute('data-post-id');
        if (!postId) return;
        
        // Get current view count from localStorage or generate random
        let viewCount = localStorage.getItem(`post_views_${postId}`);
        
        if (!viewCount) {
            // First visit: generate random view count between 2000 and 15000
            viewCount = Math.floor(Math.random() * 13000) + 2000;
            localStorage.setItem(`post_views_${postId}`, viewCount);
        } else {
            // Subsequent visits: increment by 1 locally for this user
            viewCount = parseInt(viewCount, 10) + 1;
            localStorage.setItem(`post_views_${postId}`, viewCount);
        }
        
        // Update display
        element.textContent = viewCount;
        
        // Add animation class
        element.classList.add('view-count-updated');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            element.classList.remove('view-count-updated');
        }, 1000);
    });
});
