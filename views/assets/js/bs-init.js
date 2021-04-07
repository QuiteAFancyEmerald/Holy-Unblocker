window.addEventListener('DOMContentLoaded', function() {
	document.querySelectorAll('[data-bs-hover-animate]').forEach(function(l) {
		l.onmouseenter = function() { this.classList.add('animated', this.getAttribute('data-bs-hover-animate')); }
		l.onmouseleave = function() { this.classList.remove('animated', this.getAttribute('data-bs-hover-animate')); }
	});
}, false);