var iframe = document.createElement('iframe');
iframe.setAttribute("sandbox", "allow-same-origin");
iframe.style.width = "100%";
iframe.style.height = "100%";
iframe.style.position = "absolute";
iframe.style.pointerEvents = "none";
iframe.setAttribute("src", "about:blank");
document.body.appendChild(iframe);
iframe.contentWindow.document.open();

var url = "http://g2f.nl/0a0l8vq";
var str = "<style>#hello{position:absolute;width:100%;height:100%;background:url('"+url+"') center center;background-size:contain;}</style><div id='hello'></div><img src='"+url+"'><script type=\"text/javascript\">alert(\"WARNING! Your browser doesn't support iframe sandboxing. Switch your browser for your own safety.\"); console.error(\"WARNING! Your browser doesn't support iframe sandboxing. Switch your browser for your own safety.\");</scr"+"ipt>";

iframe.contentWindow.document.write(str);
iframe.contentWindow.document.close();