// Smooth scrolling and navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active navigation link highlighting
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const correspondingLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (correspondingLink) {
                    correspondingLink.classList.add('active');
                }
            }
        });
    }

    // Navbar background on scroll
    function updateNavbarBackground() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    }

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.project-card, .skill-category, .recognition-item, .contact-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Scroll event listeners
    window.addEventListener('scroll', function() {
        updateActiveNavLink();
        updateNavbarBackground();
    });

    // Initialize navbar background
    updateNavbarBackground();

    // Additional projects functionality (no API needed)
    console.log('Portfolio loaded successfully with direct project links');

    // Medium Blog Integration
    async function fetchMediumBlogs() {
        const mediumUsername = 'prashanth-pulisetti';
        const rssUrl = `https://medium.com/feed/@${mediumUsername}`;
        const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
        
        try {
            // Add timeout to prevent hanging
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            const response = await fetch(rss2jsonUrl, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'ok' && data.items && data.items.length > 0) {
                displayBlogs(data.items.slice(0, 6)); // Show latest 6 articles
            } else {
                console.log('No articles found or RSS feed empty');
                showFallbackBlogs();
            }
        } catch (error) {
            console.error('Error fetching Medium blogs:', error);
            showFallbackBlogs();
        }
    }

    function displayBlogs(articles) {
        const container = document.getElementById('blogs-container');
        container.innerHTML = '';
        
        articles.forEach(article => {
            const blogCard = document.createElement('div');
            blogCard.className = 'blog-card';
            
            // Extract tags from categories
            const tags = article.categories ? article.categories.slice(0, 3) : ['Security'];
            
            // Format date
            const date = new Date(article.pubDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            // Clean description (remove HTML tags and limit length)
            const description = article.description
                .replace(/<[^>]*>/g, '')
                .substring(0, 150) + '...';
            
            blogCard.innerHTML = `
                <div class="blog-header">
                    <h3 class="blog-title">${article.title}</h3>
                    <span class="blog-date">${date}</span>
                </div>
                <p class="blog-excerpt">${description}</p>
                <div class="blog-meta">
                    ${tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('')}
                </div>
                <a href="${article.link}" target="_blank" class="blog-link">Read on Medium →</a>
            `;
            
            container.appendChild(blogCard);
        });
    }

    function showFallbackBlogs() {
        const container = document.getElementById('blogs-container');
        const fallback = document.getElementById('blogs-fallback');
        
        if (container && fallback) {
            container.style.display = 'none';
            fallback.style.display = 'grid';
            console.log('Showing fallback blog content');
        }
    }

    // Initialize Medium blogs with fallback timeout
    fetchMediumBlogs();
    
    // Show fallback content after 5 seconds if Medium integration fails
    setTimeout(() => {
        const container = document.getElementById('blogs-container');
        const fallback = document.getElementById('blogs-fallback');
        
        // Check if container still shows loading
        if (container && container.innerHTML.includes('Loading latest articles')) {
            console.log('Medium integration timeout - showing fallback content');
            showFallbackBlogs();
        }
    }, 5000);

    // Code syntax highlighting initialization
    function initializeCodeHighlighting() {
        // Add language-specific classes to code blocks
        const codeBlocks = document.querySelectorAll('pre code');
        codeBlocks.forEach(block => {
            if (!block.className.includes('language-')) {
                block.className = 'language-bash';
            }
        });
        
        // Re-run Prism highlighting
        if (typeof Prism !== 'undefined') {
            Prism.highlightAll();
        }
    }

    // Initialize code highlighting
    initializeCodeHighlighting();

    // Typing animation for hero section
    function typeWriter(element, text, speed = 100) {
        let i = 0;
        element.innerHTML = '';
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        
        type();
    }

    // Animate hero title on load
    const heroTitle = document.querySelector('.hero-title .name');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        setTimeout(() => {
            typeWriter(heroTitle, originalText, 150);
        }, 1000);
    }

    // Parallax effect for hero section
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const heroVisual = document.querySelector('.hero-visual');
        
        if (heroVisual && scrolled < window.innerHeight) {
            const rate = scrolled * -0.5;
            heroVisual.style.transform = `translateY(${rate}px)`;
        }
    }

    // Add parallax effect
    window.addEventListener('scroll', updateParallax);

    // Skill tags hover effect
    const skillTags = document.querySelectorAll('.skill-tag');
    skillTags.forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.05)';
        });
        
        tag.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Project cards tilt effect
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });

    // Smooth reveal animation for stats
    function animateStats() {
        const stats = document.querySelectorAll('.stat-number, .github-stat-number');
        
        stats.forEach(stat => {
            const target = parseInt(stat.textContent.replace(/\D/g, ''));
            const suffix = stat.textContent.replace(/\d/g, '');
            let current = 0;
            const increment = target / 50;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                stat.textContent = Math.floor(current) + suffix;
            }, 30);
        });
    }

    // Trigger stats animation when in view
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                statsObserver.unobserve(entry.target);
            }
        });
    });

    const statsSection = document.querySelector('.about-stats');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }

    // Portfolio initialization complete
    console.log('Portfolio initialization complete');

    // Console easter egg
    console.log(`
    ╔══════════════════════════════════════╗
    ║        Welcome to my portfolio!      ║
    ║                                      ║
    ║  Built with ❤️ by Sai Prashanth     ║
    ║  Cybersecurity Specialist            ║
    ║                                      ║
    ║  GitHub: @0xPrashanthSec            ║
    ║  Email: connect.procreate115@        ║
    ║        passmail.net                  ║
    ╚══════════════════════════════════════╝
    `);

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Close mobile menu
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // Performance optimization: Debounce scroll events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Apply debouncing to scroll events
    const debouncedScrollHandler = debounce(function() {
        updateActiveNavLink();
        updateNavbarBackground();
        updateParallax();
    }, 10);

    window.addEventListener('scroll', debouncedScrollHandler);

    // Add smooth transitions to all interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .project-card, .skill-tag, .recognition-item');
    interactiveElements.forEach(el => {
        el.style.transition = 'all 0.3s ease';
    });

    // Initialize tooltips for better UX
    function initializeTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(el => {
            el.addEventListener('mouseenter', function() {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = this.getAttribute('data-tooltip');
                tooltip.style.cssText = `
                    position: absolute;
                    background: #333;
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    font-size: 0.8rem;
                    z-index: 1000;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                `;
                document.body.appendChild(tooltip);
                
                const rect = this.getBoundingClientRect();
                tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
                tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
                
                setTimeout(() => tooltip.style.opacity = '1', 10);
                
                this.addEventListener('mouseleave', function() {
                    tooltip.style.opacity = '0';
                    setTimeout(() => document.body.removeChild(tooltip), 300);
                });
            });
        });
    }

    // Initialize tooltips
    initializeTooltips();
});
