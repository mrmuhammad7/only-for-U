function createFloatingElements() {
    const container = document.getElementById("floatingElements");
    const elementCount = 12;
    const elements = ["❤️", "💖", "🌹", "🌸", "💐", "🌷", "🌺"];

    for (let i = 0; i < elementCount; i++) {
        const element = document.createElement("div");
        element.classList.add("floating-element");

        const randomElement =
            elements[Math.floor(Math.random() * elements.length)];
        element.innerHTML = randomElement;

        const left = Math.random() * 100;

        const delay = Math.random() * 15;
        const duration = 8 + Math.random() * 5;

        element.style.left = `${left}%`;
        element.style.animationDelay = `${delay}s`;
        element.style.animationDuration = `${duration}s`;

        container.appendChild(element);
    }
}

function checkVisibility() {
    const sections = document.querySelectorAll(".section");

    sections.forEach((section) => {
        const sectionTop = section.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (sectionTop < windowHeight * 0.85) {
            section.classList.add("visible");
        }
    });
}

function setupGiftMessage() {
    const giftBtn = document.getElementById("giftBtn");
    const giftModal = document.getElementById("giftModal");
    const bookCover = document.getElementById("bookCover");
    const closeBtn = document.getElementById("closeBtn");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const pageIndicator = document.getElementById("pageIndicator");
    const pages = document.querySelectorAll(".page");

    let isBookOpen = false;
    let isAnimating = false;
    let currentPage = 1;
    const totalPages = pages.length;

    function updatePageNavigation() {
        pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;

        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;

        pages.forEach((page, index) => {
            if (index + 1 === currentPage) {
                page.classList.add("active");
            } else {
                page.classList.remove("active");
            }
        });
    }

    updatePageNavigation();

    prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            updatePageNavigation();
        }
    });

    nextBtn.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            updatePageNavigation();
        }
    });

    giftBtn.addEventListener("click", () => {
        giftModal.style.display = "flex";
        giftModal.setAttribute("aria-hidden", "false");
        isBookOpen = false;
        isAnimating = false;
        bookCover.classList.remove("open");
        currentPage = 1;
        updatePageNavigation();

        setTimeout(() => {
            giftModal.classList.add("show");
        }, 10);

        const bgMusic = document.getElementById("bgMusic");
        const playPromise = bgMusic.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {});
        }

        bookCover.focus();
    });

    function toggleBook() {
        if (isAnimating) return;

        isAnimating = true;

        if (!isBookOpen) {
            bookCover.classList.add("open");
            bookCover.setAttribute("aria-pressed", "true");

            setTimeout(() => {
                isBookOpen = true;
                isAnimating = false;
            }, 1500);
        } else {
            bookCover.classList.remove("open");
            bookCover.setAttribute("aria-pressed", "false");

            setTimeout(() => {
                isBookOpen = false;
                isAnimating = false;
            }, 1500);
        }
    }

    bookCover.addEventListener("click", toggleBook);
    bookCover.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " " || ev.key === "Spacebar") {
            ev.preventDefault();
            toggleBook();
        }
    });

    closeBtn.addEventListener("click", () => {
        if (isAnimating) return;

        if (isBookOpen) {
            bookCover.classList.remove("open");

            setTimeout(() => {
                giftModal.classList.remove("show");

                setTimeout(() => {
                    giftModal.style.display = "none";
                    isBookOpen = false;
                    isAnimating = false;
                    giftModal.setAttribute("aria-hidden", "true");
                    giftBtn.focus();
                }, 800);
            }, 1500);
        } else {
            giftModal.classList.remove("show");

            setTimeout(() => {
                giftModal.style.display = "none";
                isBookOpen = false;
                isAnimating = false;
                giftModal.setAttribute("aria-hidden", "true");
                giftBtn.focus();
            }, 800);
        }
    });

    giftModal.addEventListener("click", (e) => {
        if (e.target === giftModal && !isAnimating) {
            if (isBookOpen) {
                bookCover.classList.remove("open");

                setTimeout(() => {
                    giftModal.classList.remove("show");

                    setTimeout(() => {
                        giftModal.style.display = "none";
                        isBookOpen = false;
                        isAnimating = false;
                        giftModal.setAttribute("aria-hidden", "true");
                        giftBtn.focus();
                    }, 800);
                }, 1500);
            } else {
                giftModal.classList.remove("show");

                setTimeout(() => {
                    giftModal.style.display = "none";
                    isBookOpen = false;
                    isAnimating = false;
                    giftModal.setAttribute("aria-hidden", "true");
                    giftBtn.focus();
                }, 800);
            }
        }
    });

    document.addEventListener("keydown", (e) => {
        if (
            (e.key === "Escape" || e.key === "Esc") &&
            giftModal.style.display === "flex" &&
            !isAnimating
        ) {
            if (isBookOpen) {
                bookCover.classList.remove("open");
                setTimeout(() => {
                    giftModal.classList.remove("show");
                    setTimeout(() => {
                        giftModal.style.display = "none";
                        giftModal.setAttribute("aria-hidden", "true");
                        isBookOpen = false;
                        isAnimating = false;
                        giftBtn.focus();
                    }, 800);
                }, 1500);
            } else {
                giftModal.classList.remove("show");
                setTimeout(() => {
                    giftModal.style.display = "none";
                    giftModal.setAttribute("aria-hidden", "true");
                    giftBtn.focus();
                }, 800);
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    createFloatingElements();
    setupGiftMessage();
    window.addEventListener("scroll", checkVisibility);
    checkVisibility();
});
