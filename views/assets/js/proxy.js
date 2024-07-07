const form = document.getElementById("pr-form");
const address = document.getElementById("pr-url");

const searchEngine = "https://google.com/search?q=%s";

const proxy = localStorage.getItem('proxy') || 'uv';

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const url = search(address.value, searchEngine);

    let frame = document.getElementById("hu-frame");
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