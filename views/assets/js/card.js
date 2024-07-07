// Select all elements with class "box-card"
const shimmerEffects = document.querySelectorAll(".box-card");

// Loop through each ".box-card" element
shimmerEffects.forEach(shimmerEffect => {
  // Add mousemove event listener
  shimmerEffect.addEventListener("mousemove", handleMouseMove);

  // Add mouseleave event listener
  shimmerEffect.addEventListener("mouseleave", handleMouseLeave);
});

// Function to handle mousemove event
function handleMouseMove(e) {
  const rect = this.getBoundingClientRect(); // Use "this" to refer to the current ".box-card" element
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  this.style.setProperty("--mouse-x", `${x}px`);
  this.style.setProperty("--mouse-y", `${y}px`);
}

// Function to handle mouseleave event
function handleMouseLeave() {
  // Reset mouse position variables to center
  this.style.setProperty("--mouse-x", `50%`);
  this.style.setProperty("--mouse-y", `50%`);
}
