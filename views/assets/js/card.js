/* -----------------------------------------------
/* Authors: QuiteAFancyEmerald
/* GNU Affero General Public License v3.0: https://www.gnu.org/licenses/agpl-3.0.en.html
/* Card Shimmer Mouse Follow Script
/* ----------------------------------------------- */

const shimmerEffects = document.querySelectorAll(".box-card");


shimmerEffects.forEach(shimmerEffect => {
  shimmerEffect.addEventListener("mousemove", handleMouseMove);
  shimmerEffect.addEventListener("mouseleave", handleMouseLeave);
});

function handleMouseMove(e) {
  const rect = this.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  this.style.setProperty("--mouse-x", `${x}px`);
  this.style.setProperty("--mouse-y", `${y}px`);
}

function handleMouseLeave() {
  this.style.setProperty("--mouse-x", `50%`);
  this.style.setProperty("--mouse-y", `50%`);
}