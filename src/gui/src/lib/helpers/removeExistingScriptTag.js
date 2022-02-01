export default function(widget) {
  const xx = document.querySelector(`script[data-name="${widget.name}"]`);
  if ( xx && xx.getAttribute('data-id') !== widget.id) {
    xx.remove();
    return true;
  }
  return false;
}
