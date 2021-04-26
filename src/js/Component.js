const Component = function (tag, className, html) {
  const domEl = document.createElement(tag);
  domEl.className = className;
  if (html) domEl.innerHTML = html;
  return domEl;
};

export default Component;
