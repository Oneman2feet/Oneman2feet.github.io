(function() {
  window.onscroll = function(e){
    var rect = document.getElementsByTagName('header')[0].getBoundingClientRect();
    if (rect.bottom<0) {
      document.getElementsByTagName('nav')[0].classList.add("sticky");
    } else {
      document.getElementsByTagName('nav')[0].classList.remove("sticky");
    }
  };
})();