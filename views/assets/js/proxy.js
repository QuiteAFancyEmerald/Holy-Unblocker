const form = document.getElementById("pr-form");
const address = document.getElementById("pr-url");

let frame = document.getElementById("hu-frame");

const searchEngine = "https://google.com/search?q=%s";

const proxy = localStorage.getItem('proxy');

const url = search(address.value, searchEngine);

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  frame.style.display = "block";

  if (proxy === "uv") {
    try {
      await registerSW();
    } catch (err) {
      window.location.href = "/pages/error/error.html";
      throw err;
    }

    frame.src = __uv$config.prefix + __uv$config.encodeUrl(url);
  } else if (proxy === "rh") {
    frame.src = await RammerheadEncode(url);
  } // lmfao
});
