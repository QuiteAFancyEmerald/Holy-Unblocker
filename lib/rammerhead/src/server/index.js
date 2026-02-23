import express from "express";
import session from "express-session";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware to parse forms
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Session setup
app.set("trust proxy", 1);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);

// Serve static files (login page, CSS, etc.)
app.use(express.static(path.join(__dirname, "public")));

// 🔐 Login-required middleware
function requireLogin(req, res, next) {
  if (!req.session.loggedIn) {
    return res.redirect("/login");
  }
  next();
}

// Login page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"));
});

// Handle login form
app.post("/submit-passcode", (req, res) => {
  const pass = req.body.passcode;

  if (pass === process.env.PASSCODE) {
    req.session.loggedIn = true;
    return res.redirect("/proxy");
  }

  return res.redirect("/login?error=1");
});

// 🔗 PROXY ROUTE — sends secret header to Fly.io
app.get("/proxy", requireLogin, async (req, res) => {
  try {
    const response = await axios.get("https://scbypass.fly.dev", {
      headers: {
        "X-SCBYPASS-Key": process.env.SCB_SECRET_KEY,
      },
    });

    res.send(response.data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send("Proxy error");
  }
});

// Example protected home page
app.get("/home", requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, "public/home.html"));
});

// Start server
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Replit login system running on port ${port}`);
});

