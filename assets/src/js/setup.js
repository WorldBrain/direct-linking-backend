let LOADED = false

export async function injectGoogleFonts() {
    if (LOADED) {
        return
    }

    await loadGoogleFonts()
    LOADED = true
}

function loadGoogleFonts() {
    return new Promise(function (resolve, reject) {
        window.WebFontConfig = {
            google: { families: ['Lato'] },
            active: resolve,
            inactive: resolve
         };
      
         (function(d) {
            var wf = d.createElement('script'), s = d.scripts[0];
            wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
            wf.async = true;
            s.parentNode.insertBefore(wf, s);
        })(document);
    })
}
