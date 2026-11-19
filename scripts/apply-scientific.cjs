/* Apply shared design to generated reference pages without editing their content. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const dist=path.resolve(__dirname,'../dist');
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(path.join(dist,f))).digest('hex').slice(0,12);
const settingsURL='/settings.js?v='+hash('settings.js');
function applySettings(html) {
 const prior=/<script src="\/?settings\.js(?:\?[^"]*)?"><\/script>/;
 const tag=`<script src="${settingsURL}"></script>`;
 return prior.test(html) ? html.replace(prior,tag) : html.replace('</head>',tag+'</head>');
}
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(entry.name.endsWith('.html')){let html=fs.readFileSync(file,'utf8');html=html.replace(/<link rel="stylesheet" href="\/?scientific\.css[^"\s]*">/g,'').replace('</head>',`<link rel="stylesheet" href="/scientific.css?v=${hash('scientific.css')}"></head>`);if(file===path.join(dist,'index.html')){html=html.replace(/<script src="scientific\.js[^"\s]*"><\/script>/g,'').replace('</body>',`<script src="scientific.js?v=${hash('scientific.js')}"></script></body>`);}fs.writeFileSync(file,applySettings(html));}}}
walk(dist);
console.log('Applied Scientific Premium presentation to all HTML pages.');
