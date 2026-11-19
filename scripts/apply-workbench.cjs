/* Preview only on the application entry page; reference pages remain unchanged. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../dist'),file=path.join(root,'index.html');
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex').slice(0,12);
let html=fs.readFileSync(file,'utf8');
html=html.replace(/<link rel="stylesheet" href="workbench\.css[^"\s]*">/g,'').replace(/<script src="workbench\.js[^"\s]*"><\/script>/g,'');
html=html.replace('</head>',`<link rel="stylesheet" href="workbench.css?v=${hash('workbench.css')}"></head>`).replace('</body>',`<script src="workbench.js?v=${hash('workbench.js')}"></script></body>`);
fs.writeFileSync(file,html);console.log('Applied workspace preview to index.html only.');
