export default function(widget) {
  const name = widget.url.split('/').reverse()[0].match(/^(.*?)\.umd/)[1];

  window[name] = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.addEventListener('load', () => {
      resolve(window[name]);
    });
    script.addEventListener('error', () => {
      reject(new Error(`Error loading ${widget.url}`));
    });
    script.src = widget.url;
    script.setAttribute('data-name', widget.name);
    script.setAttribute('data-id', widget.id);
    document.head.appendChild(script);
  });

  return window[name];
}
