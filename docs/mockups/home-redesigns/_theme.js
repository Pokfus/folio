// mockup-only: ?theme=dark or ?theme=light overrides the system preference
(function(){var t=new URLSearchParams(location.search).get("theme");if(t==="dark")document.documentElement.classList.add("night");if(t==="light")document.documentElement.classList.add("light");})();
