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

document.addEventListener("DOMContentLoaded", createFloatingElements);

// Show/hide flipbook when clicking the gift button and initialize turn.js on show
function setupGiftButton() {
    const giftBtn = document.getElementById("giftBtn");
    const flipbook =
        document.getElementById("flipbook") ||
        document.querySelector(".flipbook");
    if (!giftBtn || !flipbook) return;

    // ensure button accessibility state
    giftBtn.setAttribute("aria-controls", "flipbook");
    giftBtn.setAttribute("aria-expanded", "false");

    // helper: compute turn size based on viewport (keeping 1000x600 aspect)
    // and also compute the margin needed to center the book
    function computeTurnSize() {
        const maxWidth = 1000; // same as CSS max-width
        // on large screens, use full width; on small screens, leave 5% margin
        const paddingFactor = window.innerWidth > 1024 ? 1.0 : 0.95;
        const vw = Math.min(window.innerWidth * paddingFactor, maxWidth);
        const aspect = 600 / 1000; // height/width ratio
        const width = Math.round(vw);
        const height = Math.round(vw * aspect);

        // calculate margin needed to center the book before opening
        // on large screens (> 1024px), use auto centering from CSS
        const margin =
            window.innerWidth > 1024
                ? 0
                : Math.max(0, (window.innerWidth - width) / 2);

        return { width, height, margin };
    }

    // apply centering margin to flipbook when it's closed
    function applyCenteringMargin() {
        const sz = computeTurnSize();
        flipbook.style.marginLeft = sz.margin + "px";
        flipbook.style.marginRight = sz.margin + "px";
    }

    // debounce helper
    function debounce(fn, wait) {
        let t;
        return function () {
            clearTimeout(t);
            const args = arguments;
            t = setTimeout(() => fn.apply(this, args), wait);
        };
    }

    // Initialize or resize turn.js instance
    function initOrResizeTurn() {
        if (
            typeof $ === "undefined" ||
            typeof $.fn === "undefined" ||
            typeof $.fn.turn !== "function"
        )
            return;
        const sz = computeTurnSize();
        // if not initialized, initialize with computed size
        if (!flipbook.dataset.turnInitialized) {
            try {
                $(flipbook).turn({
                    width: sz.width,
                    height: sz.height,
                    autoCenter: true,
                });
                flipbook.dataset.turnInitialized = "true";
            } catch (err) {
                console.warn("turn() initialization failed:", err);
            }
        } else {
            // already initialized: update size
            try {
                $(flipbook).turn("size", sz.width, sz.height);
            } catch (err) {
                console.warn("turn() resize failed:", err);
            }
        }
    }

    // also handle centering margin on resize
    const debouncedResize = debounce(function () {
        if (flipbook.classList.contains("hidden")) {
            // book is closed: adjust margin to keep it centered
            applyCenteringMargin();
        } else {
            // book is open: resize turn.js
            initOrResizeTurn();
        }
    }, 200);

    // store original button text to restore on close
    const originalBtnText = giftBtn.textContent.trim();

    giftBtn.addEventListener("click", function (e) {
        e.preventDefault();
        const isHidden = flipbook.classList.contains("hidden");

        if (isHidden) {
            // start opening: make element displayable and start from small scale
            flipbook.classList.remove("hidden");
            flipbook.classList.add("animating");
            flipbook.setAttribute("aria-hidden", "false");
            giftBtn.setAttribute("aria-expanded", "true");

            // center via CSS/inline to make sure turn.js can size properly
            flipbook.style.marginLeft = "auto";
            flipbook.style.marginRight = "auto";

            // next frame, add visible to trigger transition to full scale
            requestAnimationFrame(() => {
                // force reflow then add visible
                void flipbook.offsetWidth;
                flipbook.classList.add("visible");
                flipbook.classList.remove("animating");
            });

            // when transition ends, initialize turn and attach resize listener
            const onOpenEnd = function (ev) {
                if (
                    ev.propertyName !== "transform" &&
                    ev.propertyName !== "opacity"
                )
                    return;
                flipbook.removeEventListener("transitionend", onOpenEnd);
                try {
                    initOrResizeTurn();
                } catch (err) {
                    console.warn("initOrResizeTurn failed after open:", err);
                }
                window.addEventListener("resize", debouncedResize);
            };
            flipbook.addEventListener("transitionend", onOpenEnd);

            // update button label to 'close' in Arabic
            giftBtn.textContent = "Close Your Gift Book!";
        } else {
            // start closing animation: remove visible -> element will scale down
            flipbook.classList.remove("visible");
            flipbook.classList.add("hiding");
            flipbook.setAttribute("aria-hidden", "true");
            giftBtn.setAttribute("aria-expanded", "false");

            // on animation end, fully hide (remove from layout) and restore margins
            const onCloseEnd = function (ev) {
                if (
                    ev.propertyName !== "transform" &&
                    ev.propertyName !== "opacity"
                )
                    return;
                flipbook.removeEventListener("transitionend", onCloseEnd);
                // hide completely
                flipbook.classList.remove("hiding");
                flipbook.classList.add("hidden");

                // remove inline centering so page layout returns to normal
                flipbook.style.marginLeft = "";
                flipbook.style.marginRight = "";

                // re-apply centering margin logic for closed state (if needed)
                applyCenteringMargin();

                // detach resize listener
                window.removeEventListener("resize", debouncedResize);
            };

            flipbook.addEventListener("transitionend", onCloseEnd);

            // restore original button label
            giftBtn.textContent = originalBtnText;
        }
    });

    // apply initial centering margin when page loads
    applyCenteringMargin();
    // attach resize listener to handle centering when closed
    window.addEventListener("resize", debouncedResize);
}

// Lightbox behavior: click flipbook images to open overlay, click outside to close
(function () {
    function openOverlay(src, alt) {
        // create overlay
        const overlay = document.createElement("div");
        overlay.className = "img-overlay";
        overlay.tabIndex = 0;

        const img = document.createElement("img");
        img.src = src;
        if (alt) img.alt = alt;

        overlay.appendChild(img);
        document.body.appendChild(overlay);
        // prevent background scrolling/touch
        document.body.classList.add("overlay-open");

        // show with transition
        requestAnimationFrame(() => overlay.classList.add("show"));

        function close() {
            overlay.classList.remove("show");
            document.body.classList.remove("overlay-open");
            overlay.addEventListener("transitionend", () => overlay.remove(), {
                once: true,
            });
            window.removeEventListener("keydown", onKeydown);
        }

        function onKeydown(e) {
            if (e.key === "Escape") close();
        }

        // click outside image closes; click on image does not
        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) close();
        });

        window.addEventListener("keydown", onKeydown);
    }

    // delegate clicks on images inside the flipbook
    document.addEventListener(
        "click",
        function (e) {
            const target = e.target;
            if (!target) return;
            // only handle images that are inside the flipbook element
            const flipbook = document.getElementById("flipbook");
            if (!flipbook) return;
            if (flipbook.contains(target) && target.tagName === "IMG") {
                // prevent the flip plugin from reacting to the click
                e.stopPropagation();
                e.preventDefault();
                openOverlay(target.src, target.alt || "");
            }
        },
        true
    );
})();

document.addEventListener("DOMContentLoaded", setupGiftButton);

let up = document.querySelector("footer>a:last-of-type");

window.onscroll = function () {
    if (this.scrollY >= 200) up.classList.add("show");
    else up.classList.remove("show");
};
