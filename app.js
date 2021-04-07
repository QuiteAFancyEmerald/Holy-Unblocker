/* -----------------------------------------------
 * Authors: QuiteAFancyEmerald, YÖCTDÖNALD'S, SexyDuceDuce, BinBashBanana (OlyB)
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

let text404 = fs.readFileSync(path.normalize(__dirname + '/views/404.html'), 'utf8');

// List of the querystring pages
let siteIndex = 'index.html';

let pages = {
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
};

// List of random cooking-related strings to mess with web filters
var cookingInserts = [
	"Boost your confidence in the kitchen with our trusted tips, tricks and expert advice to master the basics and build upon your existing cooking skills and knowledge.",
	"Methods Heat can transform the flavor and texture of ingredients. Browning meat and other ingredients, for example, involves complex chemical reactions. Fruits and vegetables contain sugars that caramelize when browned. The reaction in browning proteins, such as those in meat and poultry, is called the Maillard reaction after Louis Camille Maillard, the French chemist who discovered it. The Maillard reaction produces many new chemical compounds. These compounds give the food new flavors and aromas. The browned bits of food that stick to a pan are called fond, a French word meaning bottom. Many sauces make use of the rich, complex flavors of fond. Browning can only occur at temperatures above the boiling point of water, which is 212 °F (100 °C) at sea level. For this reason, moisture around the exterior of food must evaporate before the food can brown. Air and fat, as well as the metal surfaces of pans, can reach extremely high temperatures in browning. But cooking ingredients at high temperature for too long removes moisture, turning food dry and chewy. Skilled cooks will therefore carefully control both heat and moisture when cooking. Cooking with dry heat involves exposing food to hot air. As the air moves around the food’s surface, its heat is transferred to the cooler food. Roasting traditionally involved cooking large pieces of meat—or even a whole animal, such as a pig or a lamb—over an open fire. But today, roasting generally refers to cooking food in a hot oven. Roasting meat or vegetables in a high temperature oven—above 400 °F (205 °C)—causes the food to brown quickly. But high temperatures can also dry out food.",
	"Cuisines Often, a certain combination of ingredients forms the foundation of a particular cuisine. For example, Cantonese cuisine, based in southern China, makes much use of scallions, garlic, and ginger. Greek dishes often include garlic, olive oil, and oregano. Cuisines are often based on locally available ingredients. In the coastal city of Boston, for example, traditional favorites include such seafood dishes as clam chowder and lobster. Many cuisines reflect the variety of cultures in an area. In Louisiana, for example, such dishes as gumbo (a spicy stew) combine African American, Native American, and French cooking traditions. Preparation of ingredients Many ingredients must be prepared before cooking. Some fruits and vegetables must be peeled. Cooks may remove the skin, bones, and fat from meat or the shells from seafood. Cooks may also cut ingredients in a variety of ways, including dicing (cutting into small cubes) and mincing (chopping extremely fine). The size of the pieces helps determine how fast they cook, as well as the texture of the finished dish. Many cooks season food with salt, spices, and herbs before cooking. Ingredients must be prepared with safety in mind. Fruits and vegetables should generally be rinsed to remove any residues from agricultural chemicals. In addition, raw meats may contain disease-causing organisms. Proper cooking usually kills such organisms. But anything the meat touches can also become contaminated. Cooks must thus be careful when handling raw meat. They can help prevent food-borne illness by using soap and hot water to wash their hands, along with any surface that has touched raw meat.",
	"The key to good salmon is not overthinking it. Today, all we’re doing is rubbing the fillets with a little oil and sprinkling them with salt and pepper before popping them in the oven. Even thick fillets of salmon will cook very quickly so don’t wander too far from the oven. Aim for four to six minutes per half-inch of thickness. Since most fillets are about one inch thick in the thickest part, start checking around eight minutes. When the fish starts to flake easily with a fork and the flesh looks opaque, it’s time for dinner!",
	"Rice is a staple in any kitchen, and with so many different types, it lends itself to a limitless number of recipes. Before you add the same type of rice to every recipe you prepare, however, think twice. Substituting one type of rice for another can really alter the result of a recipe. Each type of rice has its own taste, texture, and unique properties that work well with different cooking applications. So how do you know which one is the best type of rice to use? This guide examines factors that differentiate types of rice, from nutty basmati to fragrant jasmine and more!",
	"Healthy oatmeal recipes I really enjoy the taste of plain oatmeal with simple brown sugar and nothing else. It’s my comfort zone. But I also like to vary up my oatmeal and use it as my base to enjoy some fresh fruit for the day. I like to have fun with some healthy oatmeal recipes that take the simple humble bowl of oats and make them an extraordinary superfood breakfast bowl. Here are 3 of my favorite recipes: Maple Brown Sugar: This is a classic flavor most oatmeal packets come in. But the homemade maple brown sugar is so much better. I make it with brown sugar, maple syrup, pecans and cinnamon. How to make oatmeal - maple brown sugar variation Banana Nut: This is another one of the classic oatmeal flavors that comes in a packet, so I love recreating it with actual fresh bananas (not the taste of bananas). I usually slice half a banana and add walnuts, ground flaxseeds and cinnamon. How to make oatmeal - banana nut variation Strawberry & Cream: This is such a dreamy yummy combination. Just add fresh sliced strawberries, a splash of half and half or coconut cream or any non-dairy creamer, along with some honey and a touch of vanilla extract.",
	"Working one ball of dough at a time, take one ball of dough and flatten it with your hands on a lightly floured work surface. Starting at the center and working outwards, use your fingertips to press the dough to 1/2-inch thick. Turn and stretch the dough until it will not stretch further. Let the dough relax 5 minutes and then continue to stretch it until it reaches the desired diameter - 10 to 12 inches. Treat the dough gently! You can also hold up the edges of the dough with your fingers, letting the dough hang and stretch, while working around the edges of the dough. If a hole appears in your dough, place the dough on a floured surface and push the dough back together to seal the hole. Use your palm to flatten the edge of the dough where it is thicker. Pinch the edges if you want to form a lip.",
	"Add the beef to a large skillet over medium-high heat. Break the meat apart with a wooden spoon. Add the chili powder, cumin, salt, oregano, garlic powder, and pepper to the meat. Stir well. Cook until the meat is cooked through, about 6-8 minutes, stirring occasionally. Reduce the heat to medium. Add the tomato sauce and water. Stir to combine. Cook, stirring occasionally, for 7-8 minutes, until some of the liquid evaporates but the meat mixture is still a little saucy. Remove from the heat. Warm the taco shells according to their package directions. Fill the taco shells with 2 heaping tablespoons of taco meat. Top with desired taco toppings: shredded cheese, shredded lettuce, chopped tomatoes, diced red onion, taco sauce, sour cream, guacamole, etc.",
	"Warm and inviting, home cooking has resurfaced with all the kudos it deserves. Diana's menu reflects some of the most sought after recipes there are. They call it comfort food for a reason! Mac and Cheese with Butternut Squash, Chicken Pot Pie, Pork Ragu over Easy Creamy Polenta, Beef and Bacon Meatloaf with Garlic Mashed Potatoes, Boston Cream...",
	"Sous Vide is a cooking method that came from a French term that means under pressure. In the process, food is sealed in an airtight bag made from plastic material. The food is then cooked in the water longer than the usual cooking time. This can be done in meats and vegetables through precisely regulated temperature, which is much lower than usually used for cooking. The temperature normally ranges from 120 deg to 160 deg depending of desired doneness. This method is intentionally done so that meats and vegetables are cooked evenly without overcooking the outside portion while keeping the food's inside portion properly done as well as keeping its juiciness. There are several ways how the Sous Vide method can be used in our property whether or not using a Sous Vide machine. The Sous Vide method is a practice that has been used in many fine-dining restaurants with famous chefs. However, this kind of cooking method is now being used for home cooking because available solutions are now increasing its availability in the market."
];

var vegetables = ['Beet', 'Radish', 'Potato', 'Yam', 'Carrot', 'Garlic', 'Onion', 'Asparagus', 'Rhubarb', 'Celery', 'Lettuce', 'Spinach', 'Kale', 'Cabbage', 'Arugula', 'Broccoli', 'Artichoke', 'Cauliflower', 'Tomato', 'Avocado', 'Pepper', 'Squash', 'Pumpkin', 'Zucchini'];

function randomListItem(lis) {
	return lis[Math.floor(Math.random() * lis.length)];
}

function insertCooking(str) {
	return str.replace(/<!-- IMPORTANT-HUCOOKINGINSERT-DONOTDELETE -->/g, function() { return '<span style="display: none;" data-cooking="' + randomListItem(vegetables) + '" data-ingredients="' + randomListItem(vegetables) + '">' + randomListItem(cookingInserts) + '</span>'; });
}

function tryReadFile(file) {
	return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : text404;
}

// Local alloy proxy
const localAlloy = new alloy({
	prefix: '/fetch/',
	error: (proxy) => { proxy.res.send(tryReadFile(path.normalize(__dirname + '/views/error.html')).replace('%ERR%', proxy.error.info.message.replace(/<|>/g, ''))); }, // Doing replace functions on "<" and ">" to prevent XSS.
	request: [],
	response: [],
	injection: true
});
app.use(localAlloy.app);
localAlloy.ws(server);

// Querystring navigation
app.get('/', async(req, res) => res.send(insertCooking(tryReadFile(path.normalize(__dirname + '/views/' + (['/', '/?'].includes(req.url) ? siteIndex : pages[Object.keys(req.query)[0]]))))));

// Static files served
app.use(char_insert.static(path.normalize(__dirname + '/views')));

// 404 Page
app.use((req, res) => res.status(404, res.send(insertCooking(text404))));

// Start
server.listen(port);
console.log('Listening on port ' + port + '!');
