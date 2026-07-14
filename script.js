/* ==========================================================================
   PORTFOLIO INTERACTIVITY SCRIPT
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    
    // ----------------------------------------------------------------------
    // 1. PAGE LOADER
    // ----------------------------------------------------------------------
    const loader = document.getElementById("loader");
    window.addEventListener("load", () => {
        setTimeout(() => {
            loader.style.opacity = "0";
            setTimeout(() => {
                loader.style.display = "none";
            }, 500);
        }, 800); // Small pause for aesthetic appeal
    });

    // Fallback if load event doesn't trigger immediately
    setTimeout(() => {
        if (loader && loader.style.display !== "none") {
            loader.style.opacity = "0";
            setTimeout(() => {
                loader.style.display = "none";
            }, 500);
        }
    }, 3000);

    // ----------------------------------------------------------------------
    // 2. CANVAS PARTICLES SYSTEM
    // ----------------------------------------------------------------------
    const canvas = document.getElementById("particles-canvas");
    const ctx = canvas.getContext("2d");
    
    let particlesArray = [];
    let mouse = {
        x: null,
        y: null,
        radius: 120
    };

    // Handle Resize
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    }
    window.addEventListener("resize", resizeCanvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Track Mouse position
    window.addEventListener("mousemove", (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });

    window.addEventListener("mouseleave", () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Particle Object
    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
        }

        // Draw particle
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        // Update particle position & collision checks
        update() {
            // Screen collision checks
            if (this.x > canvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }

            // Mouse interaction (Repel effect)
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius + this.size) {
                    if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
                        this.x += 2;
                    }
                    if (mouse.x > this.x && this.x > this.size * 10) {
                        this.x -= 2;
                    }
                    if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
                        this.y += 2;
                    }
                    if (mouse.y > this.y && this.y > this.size * 10) {
                        this.y -= 2;
                    }
                }
            }

            // Move particle
            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }

    // Initialize particles array
    function initParticles() {
        particlesArray = [];
        let numberOfParticles = Math.min((canvas.width * canvas.height) / 10000, 100);
        
        // Get theme-specific particle color
        const isDark = !document.body.classList.contains("light-theme");
        const color = isDark ? "rgba(139, 92, 246, 0.45)" : "rgba(37, 99, 235, 0.25)";

        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 2.5) + 1;
            let x = (Math.random() * ((canvas.width - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((canvas.height - size * 2) - (size * 2)) + size * 2);
            let directionX = (Math.random() * 0.4) - 0.2;
            let directionY = (Math.random() * 0.4) - 0.2;

            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    // Draw connecting lines between close particles
    function connect() {
        let opacityValue = 1;
        const isDark = !document.body.classList.contains("light-theme");
        const connectionColor = isDark ? "139, 92, 246" : "37, 99, 235";
        const maxDist = 120;

        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let dx = particlesArray[a].x - particlesArray[b].x;
                let dy = particlesArray[a].y - particlesArray[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDist) {
                    opacityValue = 1 - (distance / maxDist);
                    ctx.strokeStyle = `rgba(${connectionColor}, ${opacityValue * 0.15})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Loop animation
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connect();
        requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();

    // ----------------------------------------------------------------------
    // 3. THEME TOGGLE (DARK / LIGHT MODE)
    // ----------------------------------------------------------------------
    const themeToggleBtn = document.getElementById("theme-toggle");
    
    // Check saved theme or preference
    const currentTheme = localStorage.getItem("theme");
    if (currentTheme === "light") {
        document.body.classList.remove("dark-theme");
        document.body.classList.add("light-theme");
        initParticles(); // Re-init colors
    } else {
        document.body.classList.add("dark-theme");
        document.body.classList.remove("light-theme");
    }

    themeToggleBtn.addEventListener("click", () => {
        document.body.classList.toggle("light-theme");
        document.body.classList.toggle("dark-theme");
        
        const newTheme = document.body.classList.contains("light-theme") ? "light" : "dark";
        localStorage.setItem("theme", newTheme);
        initParticles(); // Reset particle colors based on active theme
    });

    // ----------------------------------------------------------------------
    // 4. STICKY HEADER & SCROLL TO TOP DISPLAY
    // ----------------------------------------------------------------------
    const header = document.getElementById("header");
    const scrollTopBtn = document.getElementById("scroll-to-top");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("nav-scrolled");
        } else {
            header.classList.remove("nav-scrolled");
        }

        if (window.scrollY > 500) {
            scrollTopBtn.classList.add("active-scroll");
        } else {
            scrollTopBtn.classList.remove("active-scroll");
        }
    });

    scrollTopBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    // ----------------------------------------------------------------------
    // 5. RESPONSIVE MOBILE NAVIGATION MENU
    // ----------------------------------------------------------------------
    const hamburger = document.getElementById("hamburger");
    const navMenu = document.getElementById("nav-menu");
    const navLinks = document.querySelectorAll(".nav-link");

    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
    });

    // Close menu when a link is clicked
    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            hamburger.classList.remove("active");
            navMenu.classList.remove("active");
        });
    });

    // ----------------------------------------------------------------------
    // 6. DYNAMIC ACTIVE MENU SELECTION ON SCROLL
    // ----------------------------------------------------------------------
    const sections = document.querySelectorAll("section[id]");

    window.addEventListener("scroll", () => {
        const scrollY = window.scrollY;

        sections.forEach((current) => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120; // Padding offset
            const sectionId = current.getAttribute("id");
            const correspondingLink = document.querySelector(`.nav-menu a[href*='${sectionId}']`);

            if (correspondingLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    correspondingLink.classList.add("active-link");
                } else {
                    correspondingLink.classList.remove("active-link");
                }
            }
        });
    });

    // ----------------------------------------------------------------------
    // 7. HERO SECTION TYPING ANIMATION (TYPEWRITER EFFECT)
    // ----------------------------------------------------------------------
    const typewriter = document.getElementById("typewriter");
    const words = [
        "AI & Data Science Student.",
        "Machine Learning Enthusiast.",
        "Python Developer.",
        "Data Analyst."
    ];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function typeEffect() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            typewriter.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50; // Delete faster
        } else {
            typewriter.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }

        // Handle word switching
        if (!isDeleting && charIndex === currentWord.length) {
            typingSpeed = 2000; // Pause at end of word
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typingSpeed = 500; // Small delay before typing new word
        }

        setTimeout(typeEffect, typingSpeed);
    }
    
    // Start Typing
    setTimeout(typeEffect, 1000);

    // ----------------------------------------------------------------------
    // 8. SCROLL REVEAL OBSERVER
    // ----------------------------------------------------------------------
    const revealElements = document.querySelectorAll(".reveal");

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("revealed");
                // Stop observing once animated
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach((element) => {
        revealObserver.observe(element);
    });

    // ----------------------------------------------------------------------
    // 9. ANIMATED SKILLS TABS & BAR GRAPH FILLS
    // ----------------------------------------------------------------------
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".skills-content");

    tabBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-tab");

            // Toggle Active Tab Buttons
            tabBtns.forEach((b) => b.classList.remove("active-tab"));
            btn.classList.add("active-tab");

            // Toggle Content Visibility
            tabContents.forEach((content) => {
                content.classList.remove("active-content");
                if (content.getAttribute("id") === targetTab) {
                    content.classList.add("active-content");
                    
                    // Animate bars in the newly activated tab
                    animateActiveTabBars(content);
                }
            });
        });
    });

    function animateActiveTabBars(contentElement) {
        const bars = contentElement.querySelectorAll(".skill-bar");
        bars.forEach((bar) => {
            const width = bar.getAttribute("data-width");
            // Small timeout to allow tab transition animation to settle
            setTimeout(() => {
                bar.style.width = width;
            }, 100);
        });
    }

    // Animate the initial active tab skill bars when they scroll into view
    const skillsSection = document.getElementById("skills");
    const skillBarsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const activeContent = document.querySelector(".skills-content.active-content");
                if (activeContent) {
                    animateActiveTabBars(activeContent);
                }
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    if (skillsSection) {
        skillBarsObserver.observe(skillsSection);
    }

    // ----------------------------------------------------------------------
    // 10. ANIMATED STATS COUNTER INCREMENTS
    // ----------------------------------------------------------------------
    const statsContainer = document.querySelector(".about-stats");
    const statNumbers = document.querySelectorAll(".stat-number");
    let hasCounted = false;

    function runCounters() {
        statNumbers.forEach((stat) => {
            const target = parseFloat(stat.getAttribute("data-target"));
            const isFloat = target % 1 !== 0;
            const duration = 2000; // 2 seconds
            const startTime = performance.now();

            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease out cubic logic
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                const currentValue = easeProgress * target;

                if (isFloat) {
                    stat.textContent = currentValue.toFixed(1);
                } else {
                    stat.textContent = Math.floor(currentValue);
                }

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    stat.textContent = target; // Ensure exact final value
                }
            }

            requestAnimationFrame(updateCounter);
        });
    }

    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && !hasCounted) {
                runCounters();
                hasCounted = true;
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    if (statsContainer) {
        statsObserver.observe(statsContainer);
    }

    // ----------------------------------------------------------------------
    // 11. CONTACT FORM VALIDATION & INTERACTIVE RESPONSE
    // ----------------------------------------------------------------------
    const contactForm = document.getElementById("contact-form");
    const nameInput = document.getElementById("form-name");
    const emailInput = document.getElementById("form-email");
    const subjectInput = document.getElementById("form-subject");
    const messageInput = document.getElementById("form-message");
    const successBanner = document.getElementById("form-success-banner");

    function validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    function showInputError(inputElement, isValid) {
        const formGroup = inputElement.parentElement;
        if (!isValid) {
            formGroup.classList.add("invalid");
        } else {
            formGroup.classList.remove("invalid");
        }
    }

    // Interactive error removal on input typing
    [nameInput, emailInput, subjectInput, messageInput].forEach((input) => {
        input.addEventListener("input", () => {
            if (input === emailInput) {
                if (validateEmail(input.value)) showInputError(input, true);
            } else {
                if (input.value.trim() !== "") showInputError(input, true);
            }
        });
    });

    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        let formValid = true;

        // Name Validation
        if (nameInput.value.trim() === "") {
            showInputError(nameInput, false);
            formValid = false;
        } else {
            showInputError(nameInput, true);
        }

        // Email Validation
        if (!validateEmail(emailInput.value)) {
            showInputError(emailInput, false);
            formValid = false;
        } else {
            showInputError(emailInput, true);
        }

        // Subject Validation
        if (subjectInput.value.trim() === "") {
            showInputError(subjectInput, false);
            formValid = false;
        } else {
            showInputError(subjectInput, true);
        }

        // Message Validation
        if (messageInput.value.trim() === "") {
            showInputError(messageInput, false);
            formValid = false;
        } else {
            showInputError(messageInput, true);
        }

        // Submit Action
        if (formValid) {
            const submitBtn = contactForm.querySelector("#submit-btn");
            const originalBtnText = submitBtn.innerHTML;
            
            // Animate submission state
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span>Sending...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;

            // Mock network call
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;

                // Show Success Message Banner
                successBanner.classList.add("show-banner");
                contactForm.reset();

                // Clear active widths of skill bars (aesthetic optional reset)
                // Hide banner after 5 seconds
                setTimeout(() => {
                    successBanner.classList.remove("show-banner");
                }, 5000);

            }, 1500);
        }
    });
});
