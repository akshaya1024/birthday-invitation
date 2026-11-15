const cakeButton = document.getElementById("cakeButton");
const invitation = document.getElementById("invitation");
const sparkleContainer = document.getElementById("sparkleContainer");

const scratchCanvases = document.querySelectorAll(".scratchCanvas");

let setupDone = false;
let revealedCards = 0;

// 1. Cake click - Open invitation
cakeButton.addEventListener("click", function () {
    cakeButton.style.display = "none";
    invitation.classList.add("show");

    createSparkles();

    setTimeout(function () {
        if (!setupDone) {
            setupScratchCards();
            setupDone = true;
        }
    }, 300);
});

// 2. Falling golden sparkles
function createSparkles() {
    const symbols = ["✦", "✨", "⋆", "✧"];

    for (let i = 0; i < 45; i++) {
        const sparkle = document.createElement("span");

        sparkle.className = "sparkle";
        sparkle.textContent =
            symbols[Math.floor(Math.random() * symbols.length)];

        sparkle.style.left = Math.random() * 100 + "vw";
        sparkle.style.animationDuration =
            (2 + Math.random() * 3) + "s";
        sparkle.style.animationDelay =
            Math.random() * 2 + "s";

        sparkleContainer.appendChild(sparkle);

        sparkle.addEventListener("animationend", function () {
            sparkle.remove();
        });
    }
}

// 3. Setup all three independent scratch cards
function setupScratchCards() {

    scratchCanvases.forEach(function (canvas) {

        const ctx = canvas.getContext("2d");
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const gradient = ctx.createLinearGradient(
            0, 0, rect.width, rect.height
        );

        gradient.addColorStop(0, "#d9a75f");
        gradient.addColorStop(0.5, "#f7dfad");
        gradient.addColorStop(1, "#c58b43");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, rect.width, rect.height);

        ctx.fillStyle = "#80502f";
        ctx.font = "bold 13px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
       const isMobile = window.matchMedia("(max-width: 480px)").matches;

        if (isMobile) {
            ctx.fillText("SCRATCH", rect.width / 2, rect.height * 0.42);
            ctx.fillText("HERE", rect.width / 2, rect.height * 0.62);
        } else {
            ctx.fillText("SCRATCH HERE", rect.width / 2, rect.height / 2);
        }

        let isScratching = false;
        let isRevealed = false;

        function getPosition(event) {
            const bounds = canvas.getBoundingClientRect();

            return {
                x: event.clientX - bounds.left,
                y: event.clientY - bounds.top
            };
        }

        function scratch(event) {
            const pos = getPosition(event);

            ctx.globalCompositeOperation = "destination-out";

            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 18, 0, Math.PI * 2);
            ctx.fill();
        }

        canvas.addEventListener("pointerdown", function (event) {
            if (isRevealed) return;

            isScratching = true;
            canvas.setPointerCapture(event.pointerId);
            scratch(event);
        });

        canvas.addEventListener("pointermove", function (event) {
            if (!isScratching || isRevealed) return;

            scratch(event);
        });

        canvas.addEventListener("pointerup", function () {
            if (!isScratching) return;

            isScratching = false;
            checkProgress();
        });

        canvas.addEventListener("pointercancel", function () {
            isScratching = false;
        });

        function checkProgress() {
            if (isRevealed) return;

            const pixels = ctx.getImageData(
                0, 0, canvas.width, canvas.height
            ).data;

            let transparent = 0;
            let total = 0;

            for (let i = 3; i < pixels.length; i += 4) {
                total++;

                if (pixels[i] < 50) {
                    transparent++;
                }
            }

            const progress = transparent / total;

            if (progress > 0.45) {
                isRevealed = true;

                ctx.clearRect(0, 0, rect.width, rect.height);
                canvas.style.pointerEvents = "none";

                revealedCards++;

                // 4. Celebration after all three cards are revealed
                if (revealedCards === 3) {
                    setTimeout(function () {
                        createSparkles();
                    }, 500);
                }
            }
        }

    });
}