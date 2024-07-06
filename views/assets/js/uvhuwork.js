const form = document.getElementById("pr-form");
const address = document.getElementById("pr-url");

const searchEngine = "https://google.com/search?q=%s";


form.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    await registerSW();
  } catch (err) {
        alert(err);
    throw err;
  }

  const url = search(address.value, searchEngine);

  let frame = document.getElementById("hu-frame");
  frame.style.display = "block";
  frame.src = __uv$config.prefix + __uv$config.encodeUrl(url);
});