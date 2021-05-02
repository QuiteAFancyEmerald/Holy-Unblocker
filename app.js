/* -----------------------------------------------
 * Authors: QuiteAFancyEmerald, BinBashBanana (OlyB), YÖCTDÖNALD'S
 * Additional help from Divide and SexyDuceDuce
 * MIT license: http://opensource.org/licenses/MIT
 * ----------------------------------------------- */
const
    alloy = require('./src/alloyproxy'),
    path = require('path'),
    config = require('./config.json'),
    fs = require('fs'),
    http = require('http'),
    express = require('express'),
    app = express(),
    port = process.env.PORT || config.port,
    server = http.createServer(app);

btoa = (str) => {
    return new Buffer.from(str).toString('base64');
}

atob = (str) => {
    return new Buffer.from(str, 'base64').toString('utf-8');
}

const text404 = fs.readFileSync(path.normalize(__dirname + '/views/404.html'), 'utf8'),
    siteIndex = 'index.html',
    pages = {
        /* Main */
        'in': 'info.html',
        'faq': 'faq.html',
        'j': 'hidden.html',
        's': 'pages/frame.html',
        'z': 'pages/surf.html',
        'c': 'pages/nav/credits.html',
        'x': 'pages/nav/bookmarklets.html',
        'i': 'pages/nav/icons.html',
        't': 'pages/nav/terms.html',
        /* Games */
        'g': 'pages/nav/gtools.html',
        'h': 'pages/nav/games5.html',
        'el': 'pages/nav/emulators.html',
        'f': 'pages/nav/flash.html',
        'm': 'pages/nav/emulibrary.html',
        /* Proxies */
        'a': 'pages/proxnav/alloy.html',
        'w': 'pages/proxnav/womginx.html',
        'p': 'pages/proxnav/pmprox.html',
        'e': 'pages/proxnav/pyb.html',
        'o': 'pages/proxnav/pydodge.html',
        'y': 'pages/proxnav/youtube.html',
        'd': 'pages/proxnav/discordhub.html',
        /* Ruffle and Webretro */
        'fg': 'archive/gfiles/flash/index.html',
        'eg': 'archive/gfiles/rarch/index.html'
    },
    fileMod = [
        "/views/assets/css/styles.min.css",
    ],
    cookingInserts = [
        "Cooking is something that most of people are doing it or try to do it. Some do it as a profession, some do it for fun, and some do it because they have to do it. People are going to cooking, because some food is raw that people cannot eat it, because it is not tasty.",
        "Olive Garden opened in 1982 specializing in Italian based food. They have pasta, breadsticks, and soup. Zuppa Toscana is a soup that is one of their most popular soups. It’s spicy kick, and creamy tasting is the best part about it. This recipe is very easy to make, but is the best at Olive Garden.",
        "Homemade chicken avocadoes lime soup, doesn’t that sound Delicious! This simple, yet filling dish can serve a family of six. The preparation time takes roughly fifteen minutes and cook time is approximately twenty minutes.",
        "Let’s discuss their Food Quality. Their very well known for their wide mixture of pizzas from pepperoni, pepperoni and sausage, Colby classic, and bourbon street.",
        "The dinner menu I will be preparing to celebrate a special occasion will include: a nice juicy steak, fresh corn on the cob, hash brown with bacon casserole, and for the dessert peanut butter pie.",
        "Enter the spice aisle and grab one bottle of onion powder and one of... hamburger seasoning. Also, go to the vegetable area and pick up one regular onion. Then, walk back to the meat section and pick up a package of ground meat. Go to the bread aisle and grab a pack of the original Hawaiian sub-rolls and a pan that the rolls will fit into. Everybody knows that cheese is what tops off a good cheeseburger slider, so go pick up a pack of the favorite type of.",
        "Entertaining for Thanksgiving can be very rewarding, and very exhausting. Over the years I have found that planning and preparing for the big day is essential. I love to cook. I enjoy preparing a wonderful Thanksgiving meal for my loved ones. Peel tomatoes with ease! Cut an X in the top, and then simmer in a pot of hot water for 15 to 30 seconds. Cool down and the skin will fall right off.",
        "To create an egg wash, whisk together a large egg with one tablespoon of water until smooth. Use as a glue to seal pastries, then brush on top for a glossy appearance.",
        "Embrace salt. Don’t be afraid to use salt; it pulls the flavors out of your dishes. Cook with kosher salt and season with sea salt.",
        "For a great hardboiled egg every time, bring your pot to a boil and then turn off the heat. Let your eggs sit in the heated pot for 12 minutes and then transfer to cold water.",
        "From the beginning of times people have relied and survived on past educators. There are many people that contribute to a individuals education. Starting off as a young child most of the information retrieved comes from home through parents, and loved ones.",
        "-Education is the process of acquiring knowledge.” True education comes in many different forms. Granted it is important to study the basic academic courses including reading, writing, arithmetic, science, and social studies which all will help set a strong foundation for the student.",
        "Education is a transforming journey of an individual. It is a journey that accompanies achievements, struggles, success, failures, importance, and efforts. Education begins at home, with parents, and continue the lifelong journey till death. It is through education, an individual’s quality life gets determined.",
        "A Formal Education teaches an individual to learn academic skills, and this Education begins at the elementary level and continues until college. The process follows a set of rules and regulations for the completion of a formal degree.",
        "Informal Type: Informal Education uses no specific tools to understand learning. A person attains Informal Education though reading books, learning bicycle, playing chess, etc. Informal Education holds equal importance in life. Non-Formal Type: Non-Formal Education uses awareness programs such as adult literacy and basic education programs to promote Education. It has no time table, syllabus, and age limit and can be adjustable.",
        "The parent function of the quadratic family is f(x) = x 2 . A transformation of the graph of the parent function is represented by the function g(x) = a(x − h) 2+ k, where a ≠ 0. Match each quadratic function with its graph. Explain your reasoning. Then use a graphing calculator to verify that your answer is correct.",
        "A quadratic function is a function that can be written in the form f(x) = a(x − h) 2+ k, where a ≠ 0. The U-shaped graph of a quadratic function is called a parabola. In Section 1.1, you graphed quadratic functions using tables of values. You can also graph quadratic functions by applying transformations to the graph of the parent function f(x) = x 2 .",
        "In Example 2b, notice that g(x) = 4x 2+ 1. So, you can also describe the graph of g as a vertical stretch by a factor of 4 followed by a translation 1 unit up of the graph of f. So, the graph of g is a refl ection in the x-axis and a vertical shrink by a factor of   1— 2of the graph of f.  Notice that the function is of the form g(x) = (ax) 2+ k, where a = 2 and k = 1.",
        "Linear equations in one variable have huge number of applications and are used in calculation of various types of problems. Some of the most common and prevalent applications of Linear equations in one variable are: 1) They are used in solving problems involving relationships between real numbers. 2) They are used in geometry for problems involving calculation of perimeter or sides. 3) They are very commonly used in problems involving Money and Percents. 4) They are used extensively in time, distance and speed problems.",
        "Formula/ General method to solve Linear Equations: 1) Clear Fractions: It involves multiplying both sides of the equation by Least Common Denominator. 2) Simplifying each side separately: This step uses distributive property to clear parentheses and combine like terms. 3) Isolating variable terms on one side 4) Substituting the proposed solution into the original equation. This formula is a generic and can be used to solve all the linear equations in one variable. Linear Inequalities: A linear inequality involves a linear expression in two variables by using any of the relational symbols such as <, >, <= or >= (IcoachMath, n.d.). A linear equality divides a plane in two parts based on the solutions of the equation. Some of the examples of linear inequalities are: x+6>=14 2x-3y<14 3a +7b<=78 a +2b>76 Linear Inequalities in Two variables: Linear equalities which involve two variables or two unknowns. The solution of a linear equality in two variables like Ax +By> C is an ordered pair (x, y) that produces a true statement when the values of x and y are substituted into the inequality (MathPlanet, n.d.). E.g. 2x + 5y>6 is a Linear inequality with x and y as two variables. Solving Quadratic Equations using factoring: Quadratic equation is an equation in which the highest power of an unknown quantity is a square (Princeton, n.d.). A general quadratic...",
        "What is Science? When it comes to the word ‘science’ most of the people have some kind of knowledge about science or when they think of it there is some kind of image related to it, a theory, scientific words or scientific research (Beyond Conservation, n.d.). Many different sorts of ideas float into an individual’s mind. Every individual has a different perception about science and how he/she perceives it. It illustrates that each person can identify science in some form. It indicates that the...",
        "We discover scientific knowledge in various natural science fields such as biology or chemistry. A common misconception about the natural sciences is that both the knowledge they reveal to us and the scientific method used in discovering this are purely analytical. This means that these sciences are rigid in facts and do not contain any subjectivity or creativity. However, the scientific method is not a rigid system of pursuing measurable facts. It contains fallacies and biases. In testing hypotheses...",
        "It more than seconds or minutes or even hours? Since the definition of time is duration and duration is just the passage of time, so the curiosity to know exactly what time is entranced my interest in Physics.",
        "The book “Physics of the Impossible” was written by Japanese American theoretical physicist Michio Kaku. Kaku generally writes books about physics or physics related topics. Among his three New Work Times best seller, Physics of Impossible is one in which Kaku utilizes discourse of theoretical advancements to acquaint themes of basic material science with the reader. In this book, Kaku represents physics in various ways so that the reader understands the significance of physics and implement in his/her...",
        "A Century of Physics By the end of the nineteenth century after more than two thousand years of intellectual struggle that began with the Greek philosophers, physical scientists had reason to believe that they were beginning to understand the universe. Their theories of matter and energy, of electricity and magnetism, of heat and sound and light were confirmed in laboratories throughout the world with increasing precision. Experimentation was the method and mathematics the language of a..."
    ],
    vegetables = ['Beet', 'Radish', 'Potato', 'Yam', 'Carrot', 'Garlic', 'Onion', 'Asparagus', 'Rhubarb', 'Celery', 'Lettuce', 'Spinach', 'Kale', 'Cabbage', 'Arugula', 'Broccoli', 'Artichoke', 'Cauliflower', 'Tomato', 'Avocado', 'Pepper', 'Squash', 'Pumpkin', 'Zucchini'],
    charRandom = ['&#x206F;', '&#x2064;', '&#x200c;', '&#65039;', '&#x2066;', '&#x206A;', '&#x206b;', '&#8300;', '&#x200C;', '&#x206E;', '&#x2062;', '&#x2061;', '&#x202D;', '&#xFE0F;'];

function randomListItem(lis) {
    return lis[Math.floor(Math.random() * lis.length)];
}

// The inline function returns are necessary to prevent all replaced things from being the same

function insertCharset(str) {
    return str.replace(/&#173;|&#8203;|<wbr>/g, function() { return randomListItem(charRandom); });
}

function insertCooking(str) {
    return str.replace(/<!-- IMPORTANT-HUCOOKINGINSERT-DONOTDELETE -->/g, function() { return '<span style="display: none;" data-sample="' + randomListItem(vegetables) + '" data-log="' + randomListItem(vegetables) + '">' + randomListItem(cookingInserts) + '</span>'; });
}

function cacheBusting(str) {
    return str.replace(/styles.min.css/g, 'styles-368357.min.css');
}

function insertAll(str) {
    return insertCharset(insertCooking(cacheBusting(str)));
}

/* Cache Busting
const stats = fs.statSync(path.normalize(__dirname + fileMod), 'utf8'), 
	seconds = (new Date().getTime() - stats.mtime);

fs.renameSync(path.normalize(__dirname + fileMod), 'links-' + seconds + '.js');

function cacheBusting(str) {
	return str.replace(/links.js/g, "links" + '-' + seconds + '.js');
}
*/

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

/* Querystring Navigation */
app.get('/', async(req, res) => res.send(insertAll(tryReadFile(path.normalize(__dirname + '/views/' + (['/', '/?'].includes(req.url) ? siteIndex : pages[Object.keys(req.query)[0]]))))));

/* Static Files Served */
app.use(express.static(path.normalize(__dirname + '/views')));
app.use((req, res) => res.status(404, res.send(insertAll(text404))));

server.listen(port);
console.log('Holy Unblocker is listening on port ' + port + '.');