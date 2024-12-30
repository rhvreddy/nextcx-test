// public/widget.js
(function () {
  const script = document.createElement("script");
  script.src = "http://localhost:4414/static/js/main.js";
  script.async = true;
  script.onload = function () {
    const targetElement = document.getElementById("chat-widget-container");
    if (window.React && window.ReactDOM && window.ChatWidget && targetElement) {
      window.ReactDOM.render(window.React.createElement(window.ChatWidget), targetElement);
    }
  };
  document.body.appendChild(script);
})();
