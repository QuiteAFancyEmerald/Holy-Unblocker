/* -----------------------------------------------
 * Authors: QuiteAFancyEmerald, YÖCTDÖNALD'S, BinBashBanana (OlyB), SexyDuceDuce
 * Additional help from Divide
 * MIT license: http://opensource.org/licenses/MIT
 * ----------------------------------------------- */
const
	char_insert = require('./src/charinsert.js'),
	alloy = require('./src/alloyproxy'),
	path = require('path'),
	config = require('./config.json'),
	fs = require('fs'),
	http = require('http'),
	express = require('express'),
	app = express(),
	port = process.env.PORT || config.port;

let server = http.createServer(app);

btoa = (str) => {
	return new Buffer.from(str).toString('base64');
}

atob = (str) => {
	return new Buffer.from(str, 'base64').toString('utf-8');
}

const text404 = fs.readFileSync(path.normalize(__dirname + '/views/404.html'), 'utf8'), 
	siteIndex = 'index.html',
	pages = {
	// Main
	'in': 'info.html',
	'faq': 'faq.html',
	'status': 'status.html',
	'j': 'hidden.html',
	's': 'pages/frame.html',
	'z': 'pages/surf.html',
	'c': 'pages/nav/credits.html',
	'x': 'pages/nav/bookmarklets.html',
	'i': 'pages/nav/icons.html',
	't': 'pages/nav/terms.html',
	// Games
	'g': 'pages/nav/gtools.html',
	'h': 'pages/nav/games5.html',
	'el': 'pages/nav/emulators.html',
	'f': 'pages/nav/flash.html',
	// Proxies
	'a': 'pages/proxnav/alloy.html',
	'w': 'pages/proxnav/womginx.html',
	'p': 'pages/proxnav/pmprox.html',
	'e': 'pages/proxnav/pydodge.html',
	'y': 'pages/proxnav/youtube.html',
	'd': 'pages/proxnav/discordhub.html',
	// Ruffle and Webretro
	'fg': 'archive/gfiles/flash/index.html',
	'eg': 'archive/gfiles/rarch/index.html'
	},
	cookingInserts = [
		"Cooking is something that most of people are doing it or try to do it. Some do it as a profession, some do it for fun, and some do it because they have to do it. People are going to cooking, because some food is raw that people cannot eat it, because it is not tasty.",
		"Olive Garden opened in 1982 specializing in Italian based food. They have pasta, breadsticks, and soup. Zuppa Toscana is a soup that is one of their most popular soups. It’s spicy kick, and creamy tasting is the best part about it. This recipe is very easy to make, but is the best at Olive Garden.",
		"Homemade chicken avocadoes lime soup, doesn’t that sound Delicious! This simple, yet filling dish can serve a family of six. The preparation time takes roughly fifteen minutes and cook time is approximately twenty minutes.",
		"Let’s discuss their Food Quality. Their very well known for their wide mixture of pizzas from pepperoni, pepperoni and sausage, Colby classic, and bourbon street.",
		"The dinner menu I will be preparing to celebrate a special occasion will include: a nice juicy steak, fresh corn on the cob, hash brown with bacon casserole, and for the dessert peanut butter pie.",
		"Enter the spice aisle and grab one bottle of onion powder and one of... hamburger seasoning. Also, go to the vegetable area and pick up one regular onion. Then, walk back to the meat section and pick up a package of ground meat. Go to the bread aisle and grab a pack of the original Hawaiian sub-rolls and a pan that the rolls will fit into. Everybody knows that cheese is what tops off a good cheeseburger slider, so go pick up a pack of the favorite type of.",
		"Entertaining for Thanksgiving can be very rewarding, and very exhausting. Over the years I have found that planning and preparing for the big day is essential. I love to cook. I enjoy preparing a wonderful Thanksgiving meal for my loved ones.",
		"Peel tomatoes with ease! Cut an X in the top, and then simmer in a pot of hot water for 15 to 30 seconds. Cool down and the skin will fall right off.",
		"To create an egg wash, whisk together a large egg with one tablespoon of water until smooth. Use as a glue to seal pastries, then brush on top for a glossy appearance.",
		"Embrace salt. Don’t be afraid to use salt; it pulls the flavors out of your dishes. Cook with kosher salt and season with sea salt.",
		"For a great hardboiled egg every time, bring your pot to a boil and then turn off the heat. Let your eggs sit in the heated pot for 12 minutes and then transfer to cold water."
	],
	vegetables = ['Beet', 'Radish', 'Potato', 'Yam', 'Carrot', 'Garlic', 'Onion', 'Asparagus', 'Rhubarb', 'Celery', 'Lettuce', 'Spinach', 'Kale', 'Cabbage', 'Arugula', 'Broccoli', 'Artichoke', 'Cauliflower', 'Tomato', 'Avocado', 'Pepper', 'Squash', 'Pumpkin', 'Zucchini'],
	charrandom = ['&#x206F;', '&#x2064;', '&#173;','&#x17B5;', '&#x2066;', '&#x206A;', '&#x206b;', '&#8300;', '&#x200C;', '&#x206E;', '&#x2062;', '&#x2061;', '&#x202D;', '&#xFE0F;'];

function randomListItem(lis) {
	return lis[Math.floor(Math.random() * lis.length)];
}

function insertCharset(str) {
	return str.replace(/&#173;|&#8203;|<wbr>/g, randomListItem(charrandom));
}

function insertCooking(str) {
	return str.replace(/<!-- IMPORTANT-HUCOOKINGINSERT-DONOTDELETE -->/g, '<span style="display: none;" data-cooking="' + randomListItem(vegetables) + '" data-ingredients="' + randomListItem(vegetables) + '">' + randomListItem(cookingInserts) + '</span>');
}

function tryReadFile(file) {
	return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : text404;
}

// Local Alloy Proxy
const localAlloy = new alloy({
	prefix: '/fetch/',
	error: (proxy) => { proxy.res.send(tryReadFile(path.normalize(__dirname + '/views/error.html')).replace('%ERR%', proxy.error.info.message.replace(/<|>/g, ''))); },
	request: [],
	response: [],
	injection: true
});

app.use(localAlloy.app);
localAlloy.ws(server);

// Querystring navigation
app.get('/', async(req, res) => res.send(insertCooking(insertCharset(tryReadFile(path.normalize(__dirname + '/views/' + (['/', '/?'].includes(req.url) ? siteIndex : pages[Object.keys(req.query)[0]])))))));

// Static files served
app.use(char_insert.static(path.normalize(__dirname + '/views')));

// 404 Page
app.use((req, res) => res.status(404, res.send(insertCooking(text404))));

server.listen(port);
console.log('Listening on port ' + port + '!');
