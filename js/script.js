document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.createElement("canvas");
  canvas.className = "network-background";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);
  const context = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nodes = [];
  let animationFrame;
  let pointerX = -1000;
  let pointerY = -1000;

  const resizeCanvas = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const createNodes = () => {
    nodes.length = 0;
    const nodeCount = Math.min(150, Math.max(75, Math.round((window.innerWidth * window.innerHeight) / 8500)));
    for (let index = 0; index < nodeCount; index += 1) {
      nodes.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        radius: Math.random() * 1.5 + 0.7
      });
    }
  };

  const drawNetwork = () => {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    nodes.forEach((node) => {
      if (!reducedMotion) {
        const distanceX = node.x - pointerX;
        const distanceY = node.y - pointerY;
        const distance = Math.hypot(distanceX, distanceY);
        const interactionRadius = 150;
        if (distance < interactionRadius && distance > 0) {
          const force = (interactionRadius - distance) / interactionRadius * 0.18;
          node.vx += (distanceX / distance) * force;
          node.vy += (distanceY / distance) * force;
        }
        node.x += node.vx;
        node.y += node.vy;
        node.vx *= 0.992;
        node.vy *= 0.992;
        const speed = Math.hypot(node.vx, node.vy);
        const minimumSpeed = 0.08;
        if (speed < minimumSpeed) {
          const angle = Math.atan2(node.vy, node.vx) || Math.random() * Math.PI * 2;
          node.vx = Math.cos(angle) * minimumSpeed;
          node.vy = Math.sin(angle) * minimumSpeed;
        }
        if (node.x < -20 || node.x > window.innerWidth + 20) node.vx *= -1;
        if (node.y < -20 || node.y > window.innerHeight + 20) node.vy *= -1;
      }
      context.beginPath();
      const pointerDistance = Math.hypot(node.x - pointerX, node.y - pointerY);
      const pointerGlow = pointerDistance < 150 ? 0.18 * (1 - pointerDistance / 150) : 0;
      context.fillStyle = `rgba(20, 28, 38, ${0.42 + pointerGlow})`;
      context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      context.fill();
    });
    nodes.forEach((node, index) => {
      nodes.slice(index + 1).forEach((other) => {
        const distance = Math.hypot(node.x - other.x, node.y - other.y);
        if (distance < 145) {
          const midpointX = (node.x + other.x) / 2;
          const midpointY = (node.y + other.y) / 2;
          const pointerDistance = Math.hypot(midpointX - pointerX, midpointY - pointerY);
          const pointerGlow = pointerDistance < 180 ? 0.08 * (1 - pointerDistance / 180) : 0;
          context.beginPath();
          context.strokeStyle = `rgba(20, 28, 38, ${0.13 * (1 - distance / 145) + pointerGlow})`;
          context.lineWidth = 0.7;
          context.moveTo(node.x, node.y);
          context.lineTo(other.x, other.y);
          context.stroke();
        }
      });
    });
    if (!reducedMotion) animationFrame = requestAnimationFrame(drawNetwork);
  };

  resizeCanvas();
  createNodes();
  drawNetwork();
  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
  });
  window.addEventListener("pointerleave", () => {
    pointerX = -1000;
    pointerY = -1000;
  });
  window.addEventListener("resize", () => {
    resizeCanvas();
    createNodes();
    if (reducedMotion) drawNetwork();
  });

  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }
  document.querySelectorAll(".expand-button").forEach((button) => {
    button.addEventListener("click", () => {
      const content = button.nextElementSibling;
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      button.querySelector("span").textContent = expanded ? "+" : "−";
      content.classList.toggle("open", !expanded);
    });
  });
  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });
  const typewriter = document.querySelector(".typewriter");
  if (typewriter) {
    const words = typewriter.dataset.words.split(",");
    let wordIndex = 0, charIndex = typewriter.textContent.length, deleting = true;
    const tick = () => {
      const word = words[wordIndex];
      if (!deleting) { charIndex++; typewriter.textContent = word.slice(0, charIndex); }
      else { charIndex--; typewriter.textContent = word.slice(0, charIndex); }
      if (!deleting && charIndex === word.length) { deleting = true; setTimeout(tick, 1600); return; }
      if (deleting && charIndex === 0) { deleting = false; wordIndex = (wordIndex + 1) % words.length; }
      setTimeout(tick, deleting ? 45 : 85);
    };
    setTimeout(tick, 1600);
  }
});
