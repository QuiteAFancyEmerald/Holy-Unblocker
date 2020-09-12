function gsearch() {
    var e, t, n, a;
    for (e = document.getElementById("gsearchbar").value.toUpperCase(), t = document.getElementById("glist"), a = 0; a < t.querySelectorAll("a[href]").length; a++)(n = t.getElementsByTagName("a")[a]).innerHTML.toUpperCase().indexOf(e) > -1 ? n.style.display = "block" : n.style.display = "none"
}