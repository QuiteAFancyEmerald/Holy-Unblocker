/* -----------------------------------------------
/* Authors: QuiteAFancyEmerald
/* GNU Affero General Public License v3.0: https://www.gnu.org/licenses/agpl-3.0.en.html
/* Card Shimmer Mouse Follow Script
/* ----------------------------------------------- */

// Encase everything in a new scope so that variables are not accidentally
// attached to the global scope.
(() => {
// Track the cursor position with respect to the top left of the card.
// The "this" keyword gets the element that invoked the event listener.
const handleMouseMove = (element) => {
    element.addEventListener('mousemove', (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      element.style.setProperty('--mouse-x', `${x}px`);
      element.style.setProperty('--mouse-y', `${y}px`);
    });
  },
  // Reset the cursor tracking variables when the cursor leaves the card.
  handleMouseLeave = (element) => {
    element.addEventListener('mouseleave', () => {
      element.style.setProperty('--mouse-x', `50%`);
      element.style.setProperty('--mouse-y', `50%`);
    });
  },
  // Get the box card elements and add the event listeners to them.
  shimmerEffects = document.querySelectorAll('.box-card, .box-hero');

/* Attach CSS variables, mouse-x and mouse-y, to elements that will be
 * given shimmer effects, by adding or modifying the style attribute.
 * CSS calculates and renders the actual shimmer effect from there.
 */
shimmerEffects.forEach(handleMouseMove);
shimmerEffects.forEach(handleMouseLeave);
})();
