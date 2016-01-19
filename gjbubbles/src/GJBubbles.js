var GJBubbles = (function () {
	'use strict';

	function randomBetween(min, max)
	{
		return min + Math.random() * (max - min);
	}

	function Bubble(x, y, dx, dy, radius, opacity, blur)
	{
		this.x = x;
		this.y = y;
		this.dx = dx;
		this.dy = dy;
		this.radius = radius;
		this.opacity = opacity;
		this.size = 0;

		// Set a minimum blur ammount
		if (blur < 0.01) {
			blur = 0.01;
		}

		// Draw the circle
		this.draw = function (canvas, context) {
			// Make the bubble grow to its full size
			if (this.size < this.radius) {
				this.size += 10;
				if (this.size > this.radius) {
					this.size = this.radius;
				}
			}

			// Check the bounds of the bubble
			this.checkBounds(canvas);

			// Move the bubble
			this.x += this.dx;
			this.y += this.dy;

			// Draw the bubble using a radial gradient
			var radgrad = context.createRadialGradient(
				this.x + this.radius,
				this.y + this.radius,
				this.size * (1 - blur),
				this.x + this.radius,
				this.y + this.radius,
				this.size
			);
			radgrad.addColorStop(0, 'rgba(255,255,255,' + this.opacity + ')');
			radgrad.addColorStop(1, 'rgba(255,255,255,0)');

			context.fillStyle = radgrad;
			context.fillRect(this.x, this.y, this.size * 2, this.size * 2);
		};

		// Checks to see if the bubble is out of bounds of the passed in canvas and reverses the direction
		this.checkBounds = function (canvas) {
			if (this.x + this.dx > canvas.width || this.x + (this.radius * 2) + this.dx < 0) {
				this.dx = -this.dx;
			}

			if (this.y + this.dy > canvas.height || this.y + (this.radius * 2) + this.dy < 0) {
				this.dy = -this.dy;
			}
		}
	}

	function draw(bubbles, canvas)
	{
		var context = canvas.getContext('2d');
		context.clearRect(0,0, canvas.width, canvas.height);
		for (var i = 0; i < bubbles.length; i++) {
			bubbles[i].draw(canvas, context);
		}
		var raf = window.requestAnimationFrame(function() {
			draw(bubbles, canvas);
		});
	}

	return {
		options: {
			bubble_count: 15,
			max_radius: 25,		// Percentage of canvas width
			min_radius: 10,
			max_opacity: 0.2,	// 0 = transparent, 1 = opaque
			min_opacity: 0.05,
			max_speed: 0.25
		},
		init: function(container_id, options) {
			// Get the options, overwriting defaults if need be
			options = options || {};
			for(var prop in options) {
				if(options.hasOwnProperty(prop)){
					this.options[prop] = options[prop];
				}
			}

			// Get the container, create a canvas and append it as a child
			var container = document.getElementById(container_id);
			var canvas = document.createElement("canvas"); 
			container.appendChild(canvas);

			// Set the canvas size to be the same as the container
			canvas.width = container.offsetWidth;
			canvas.height = container.offsetHeight;
			var context = canvas.getContext('2d');
			var max_radius = canvas.width * (this.options.max_radius / 100);
			var min_radius = canvas.width * (this.options.min_radius / 100);
			var bubbles = [];

			// Create the bubbles using setInterval to stagger their creation
			var self = this;
			var interval = setInterval(function() {
				var radius = randomBetween(min_radius, max_radius);

				// The next two options make bubbles that are smaller appear blurrier and more transparent. Bigger ones are more in focus and opaque.
				var blur = 0.8 - (radius - (canvas.width * (self.options.min_radius / 100))) / ((canvas.width * (self.options.max_radius / 100)) - (canvas.width * (self.options.min_radius / 100)));
				var opacity = blur * self.options.max_opacity;

				if (opacity < self.options.min_opacity) {
					opacity = self.options.min_opacity;
				}

				bubbles.push(new Bubble(
					randomBetween(0, canvas.width),
					randomBetween(0, canvas.height),
					randomBetween(-self.options.max_speed, self.options.max_speed),
					randomBetween(-self.options.max_speed, self.options.max_speed),
					radius,
					opacity,
					blur
				));
				
				if (bubbles.length == self.options.bubble_count) {
					clearInterval(interval);
				}
			}, 50);
			
			draw(bubbles, canvas);
		}
	};
})();