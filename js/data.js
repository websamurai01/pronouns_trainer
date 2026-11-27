const RU_LAT={'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'};
function romanize(text){return Array.from(String(text).toLowerCase()).map(function(ch){return RU_LAT[ch]!==undefined?RU_LAT[ch]:ch;}).join('');}

const ROLE_IDS=['1s','2ms','2fs','3ms','3fs','1p','2mp','2fp','3mp','3fp'];
const ROLE_META={
  '1s':{p:1,n:'s',g:'m'},'2ms':{p:2,n:'s',g:'m'},'2fs':{p:2,n:'s',g:'f'},
  '3ms':{p:3,n:'s',g:'m'},'3fs':{p:3,n:'s',g:'f'},'1p':{p:1,n:'p',g:'m'},
  '2mp':{p:2,n:'p',g:'m'},'2fp':{p:2,n:'p',g:'f'},'3mp':{p:3,n:'p',g:'m'},'3fp':{p:3,n:'p',g:'f'}
};
const ROLE_LABEL_RU={'1s':'я','2ms':'ты (м.)','2fs':'ты (ж.)','3ms':'он','3fs':'она','1p':'мы','2mp':'вы (м.)','2fp':'вы (ж.)','3mp':'они (м.)','3fp':'они (ж.)'};
const ROLE_LABEL_EN={'1s':'I','2ms':'you (m.)','2fs':'you (f.)','3ms':'he','3fs':'she','1p':'we','2mp':'you pl. (m.)','2fp':'you pl. (f.)','3mp':'they (m.)','3fp':'they (f.)'};

const PRONOUNS=[
  {role:'1s',u:'אני',p:'אֲנִי',t:'ани'},
  {role:'2ms',u:'אתה',p:'אַתָּה',t:'ата'},
  {role:'2fs',u:'את',p:'אַתְּ',t:'ат'},
  {role:'3ms',u:'הוא',p:'הוּא',t:'ху'},
  {role:'3fs',u:'היא',p:'הִיא',t:'хи'},
  {role:'1p',u:'אנחנו',p:'אֲנַחְנוּ',t:'анахну'},
  {role:'2mp',u:'אתם',p:'אַתֶּם',t:'атем'},
  {role:'2fp',u:'אתן',p:'אַתֶּן',t:'атен'},
  {role:'3mp',u:'הם',p:'הֵם',t:'хем'},
  {role:'3fp',u:'הן',p:'הֵן',t:'хен'}
];

const PREP_DATA=[
  {id:'l',he:'ל',family:'simple',stem:'ל',
   ends:['י','ך','ך','ו','ה','נו','כם','כן','הם','הן'],
   U:['לי','לך','לך','לו','לה','לנו','לכם','לכן','להם','להן'],
   P:['לִי','לְךָ','לָךְ','לוֹ','לָהּ','לָנוּ','לָכֶם','לָכֶן','לָהֶם','לָהֶן'],
   T:['ли','леха','лах','ло','ла','лану','лахем','лахен','лаhем','лаhен'],
   meaningRu:'к, кому (дательный), для; направление/адресат',
   meaningEn:'to, for (dative); direction/addressee',
   formsRu:['мне','тебе','тебе','ему','ей','нам','вам','вам','им','им'],
   formsEn:['to me','to you (m.)','to you (f.)','to him','to her','to us','to you pl. (m.)','to you pl. (f.)','to them (m.)','to them (f.)'],
   irregularRoles:[]},
  {id:'b',he:'ב',family:'simple',stem:'ב',
   ends:['י','ך','ך','ו','ה','נו','כם','כן','הם','הן'],
   U:['בי','בך','בך','בו','בה','בנו','בכם','בכן','בהם','בהן'],
   P:['בִּי','בְּךָ','בָּךְ','בּוֹ','בָּהּ','בָּנוּ','בָּכֶם','בָּכֶן','בָּהֶם','בָּהֶן'],
   T:['би','беха','бах','бо','ба','бану','бахем','бахен','баhем','баhен'],
   meaningRu:'в (внутри), в кого верить; контейнер',
   meaningEn:'in, inside; believe in (container)',
   formsRu:['во мне','в тебе','в тебе','в нём','в ней','в нас','в вас','в вас','в них','в них'],
   formsEn:['in me','in you (m.)','in you (f.)','in him','in her','in us','in you pl. (m.)','in you pl. (f.)','in them (m.)','in them (f.)'],
   irregularRoles:[]},
  {id:'shel',he:'של',family:'simple',stem:'של',
   ends:['י','ך','ך','ו','ה','נו','כם','כן','הם','הן'],
   U:['שלי','שלך','שלך','שלו','שלה','שלנו','שלכם','שלכן','שלהם','שלהן'],
   P:['שֶׁלִּי','שֶׁלְּךָ','שֶׁלָּךְ','שֶׁלּוֹ','שֶׁלָּהּ','שֶׁלָּנוּ','שֶׁלָּכֶם','שֶׁלָּכֶן','שֶׁלָּהֶם','שֶׁלָּהֶן'],
   T:['шели','шелха','шелах','шело','шела','шелану','шелахем','шелахен','шелаhем','шелаhен'],
   meaningRu:'принадлежность: чей (мой/твой…)',
   meaningEn:'belonging: whose (mine/yours…)',
   formsRu:['мой','твой','твой','его','её','наш','ваш','ваш','их','их'],
   formsEn:['mine','yours (m.)','yours (f.)','his','hers','ours','yours pl. (m.)','yours pl. (f.)','theirs (m.)','theirs (f.)'],
   irregularRoles:[]},
  {id:'et',he:'את',family:'consonant',stem:'אות',
   ends:['י','ך','ך','ו','ה','נו','=אתכם','=אתכן','ם','ן'],
   U:['אותי','אותך','אותך','אותו','אותה','אותנו','אתכם','אתכן','אותם','אותן'],
   P:['אוֹתִי','אוֹתְךָ','אוֹתָךְ','אוֹתוֹ','אוֹתָהּ','אוֹתָנוּ','אֶתְכֶם','אֶתְכֶן','אוֹתָם','אוֹתָן'],
   T:['оти','отха','отах','ото','ота','отану','этхем','этхен','отам','отан'],
   meaningRu:'маркер прямого дополнения (в русском нет); меня/тебя/его…',
   meaningEn:'direct-object marker (no Russian equivalent); me/you/him…',
   formsRu:['меня','тебя','тебя','его','её','нас','вас','вас','их','их'],
   formsEn:['me','you (m.)','you (f.)','him','her','us','you pl. (m.)','you pl. (f.)','them (m.)','them (f.)'],
   irregularRoles:['2mp','2fp']},
  {id:'im',he:'עם',family:'consonant',stem:'אית',
   ends:['י','ך','ך','ו','ה','נו','כם','כן','ם','ן'],
   U:['איתי','איתך','איתך','איתו','איתה','איתנו','איתכם','איתכן','איתם','איתן'],
   P:['אִתִּי','אִתְּךָ','אִתָּךְ','אִתּוֹ','אִתָּהּ','אִתָּנוּ','אִתְּכֶם','אִתְּכֶן','אִתָּם','אִתָּן'],
   PM:['אִיתִּי','אִיתְּךָ','אִיתָּךְ','אִיתּוֹ','אִיתָּהּ','אִיתָּנוּ','אִיתְּכֶם','אִיתְּכֶן','אִיתָּם','אִיתָּן'],
   T:['ити','итха','итах','ито','ита','итану','итхем','итхен','итам','итан'],
   meaningRu:'с; двое рядом',
   meaningEn:'with; two people side by side',
   formsRu:['со мной','с тобой','с тобой','с ним','с ней','с нами','с вами','с вами','с ними','с ними'],
   formsEn:['with me','with you (m.)','with you (f.)','with him','with her','with us','with you pl. (m.)','with you pl. (f.)','with them (m.)','with them (f.)'],
   irregularRoles:[]},
  {id:'al',he:'על',family:'yod',stem:'עלי',
   ends:['י','ך','יך','ו','ה','נו','כם','כן','הם','הן'],
   U:['עליי','עליך','עלייך','עליו','עליה','עלינו','עליכם','עליכן','עליהם','עליהן'],
   P:['עָלַי','עָלֶיךָ','עָלַיִךְ','עָלָיו','עָלֶיהָ','עָלֵינוּ','עֲלֵיכֶם','עֲלֵיכֶן','עֲלֵיהֶם','עֲלֵיהֶן'],
   T:['алай','алейха','алайих','алав','алеhа','алейну','алейхем','алейхен','алейhем','алейhен'],
   meaningRu:'на, о (о ком); поверхность, тема',
   meaningEn:'on, about (someone); surface, topic',
   formsRu:['на/о мне','на/о тебе','на/о тебе','на/о нём','на/о ней','на/о нас','на/о вас','на/о вас','на/о них','на/о них'],
   formsEn:['on/about me','on/about you (m.)','on/about you (f.)','on/about him','on/about her','on/about us','on/about you pl. (m.)','on/about you pl. (f.)','on/about them (m.)','on/about them (f.)'],
   irregularRoles:[]},
  {id:'el',he:'אל',family:'yod',stem:'אלי',
   ends:['י','ך','יך','ו','ה','נו','כם','כן','הם','הן'],
   U:['אליי','אליך','אלייך','אליו','אליה','אלינו','אליכם','אליכן','אליהם','אליהן'],
   P:['אֵלַי','אֵלֶיךָ','אֵלַיִךְ','אֵלָיו','אֵלֶיהָ','אֵלֵינוּ','אֲלֵיכֶם','אֲלֵיכֶן','אֲלֵיהֶם','אֲלֵיהֶן'],
   T:['элай','элейха','элайих','элав','элеhа','элейну','алейхем','алейхен','алейhем','алейhен'],
   meaningRu:'к (человеку/в его сторону); стрелка к адресату',
   meaningEn:'toward (a person); arrow to the addressee',
   formsRu:['ко мне','к тебе','к тебе','к нему','к ней','к нам','к вам','к вам','к ним','к ним'],
   formsEn:['toward me','toward you (m.)','toward you (f.)','toward him','toward her','toward us','toward you pl. (m.)','toward you pl. (f.)','toward them (m.)','toward them (f.)'],
   irregularRoles:[]},
  {id:'min',he:'מ',family:'irregular',stem:'מ',
   ends:['מני','מך','מך','מנו','מנה','איתנו','כם','כן','הם','הן'],
   U:['ממני','ממך','ממך','ממנו','ממנה','מאיתנו','מכם','מכן','מהם','מהן'],
   P:['מִמֶּנִּי','מִמְּךָ','מִמֵּךְ','מִמֶּנּוּ','מִמֶּנָּה','מֵאִתָּנוּ','מִכֶּם','מִכֶּן','מֵהֶם','מֵהֶן'],
   PM:['','','','','','מֵאִיתָּנוּ','','','',''],
   T:['мимени','мимха','мимех','мимену','мимена','меитану','микем','микен','меhем','меhен'],
   meaningRu:'от, из; источник',
   meaningEn:'from, out of; source',
   formsRu:['от меня','от тебя','от тебя','от него','от неё','от нас','от вас','от вас','от них','от них'],
   formsEn:['from me','from you (m.)','from you (f.)','from him','from her','from us','from you pl. (m.)','from you pl. (f.)','from them (m.)','from them (f.)'],
   irregularRoles:['1s','2ms','2fs','3ms','3fs','1p','2mp','2fp','3mp','3fp']},
  {id:'etsel',he:'אצל',family:'consonant',stem:'אצל',
   ends:['י','ך','ך','ו','ה','נו','כם','כן','ם','ן'],
   U:['אצלי','אצלך','אצלך','אצלו','אצלה','אצלנו','אצלכם','אצלכן','אצלם','אצלן'],
   P:['אֶצְלִי','אֶצְלְךָ','אֶצְלֵךְ','אֶצְלוֹ','אֶצְלָהּ','אֶצְלֵנוּ','אֶצְלְכֶם','אֶצְלְכֶן','אֶצְלָם','אֶצְלָן'],
   T:['эцли','эцлеха','эцлех','эцло','эцла','эцлену','эцлехем','эцлехен','эцлам','эцлан'],
   meaningRu:'у (в гостях, при ком-то), не «у меня есть»',
   meaningEn:'at (someone’s place), not “I have”',
   formsRu:['у меня','у тебя','у тебя','у него','у неё','у нас','у вас','у вас','у них','у них'],
   formsEn:['at my place','at your place (m.)','at your place (f.)','at his place','at her place','at our place','at your pl. place (m.)','at your pl. place (f.)','at their place (m.)','at their place (f.)'],
   irregularRoles:[]},
  {id:'bishvil',he:'בשביל',family:'consonant',stem:'בשביל',
   ends:['י','ך','ך','ו','ה','נו','כם','כן','ם','ן'],
   U:['בשבילי','בשבילך','בשבילך','בשבילו','בשבילה','בשבילנו','בשבילכם','בשבילכן','בשבילם','בשבילן'],
   P:['בִּשְׁבִילִי','בִּשְׁבִילְךָ','בִּשְׁבִילֵךְ','בִּשְׁבִילוֹ','בִּשְׁבִילָהּ','בִּשְׁבִילֵנוּ','בִּשְׁבִילְכֶם','בִּשְׁבִילְכֶן','בִּשְׁבִילָם','בִּשְׁבִילָן'],
   T:['бишвили','бишвилха','бишвилех','бишвило','бишвила','бишвилену','бишвилхем','бишвилхен','бишвилам','бишвилан'],
   meaningRu:'для (в пользу кого-то)',
   meaningEn:'for (in someone’s favor)',
   formsRu:['для меня','для тебя','для тебя','для него','для неё','для нас','для вас','для вас','для них','для них'],
   formsEn:['for me','for you (m.)','for you (f.)','for him','for her','for us','for you pl. (m.)','for you pl. (f.)','for them (m.)','for them (f.)'],
   irregularRoles:[]}
];

const PREPS={};
const FORMS={};
PREP_DATA.forEach(function(p){
  PREPS[p.id]=p;
  FORMS[p.id]={};
  ROLE_IDS.forEach(function(role,i){
    FORMS[p.id][role]={u:p.U[i],p:p.P[i],pm:(p.PM&&p.PM[i])?p.PM[i]:null,t:p.T[i],tEn:romanize(p.T[i]),ru:p.formsRu[i],en:p.formsEn[i]};
  });
});

const PRON_BY_ROLE={};
PRONOUNS.forEach(function(pr){pr.tEn=romanize(pr.t);PRON_BY_ROLE[pr.role]=pr;});

function stripNikud(s){
  let out='';
  for(const ch of String(s)){
    const cp=ch.codePointAt(0);
    if(cp>=0x0591&&cp<=0x05C7) continue;
    out+=ch;
  }
  return out;
}
const PREFIXES=[
  {id:'מ',nameRu:'мем',nameEn:'mem',meaningRu:'из, от; чем (в сравнении)',meaningEn:'from, out of; than',forms:[
    {p:'מִ',tr:'ми',tag:'plain',ruleRu:'обычная форма; следующая буква удваивается',ruleEn:'default form; the next letter is doubled'},
    {p:'מֵ',tr:'ме',tag:'guttural',ruleRu:'перед א/ע',ruleEn:'before א/ע'},
    {p:'מֵהַ',tr:'меhа',tag:'article',ruleRu:'с артиклем; пишется מה',ruleEn:'with the article; written מה'},
    {p:'מֵהָ',tr:'меhа',tag:'article',ruleRu:'с артиклем перед א/ע',ruleEn:'with the article before א/ע'}
  ]},
  {id:'ש',nameRu:'шин',nameEn:'shin',meaningRu:'что, который, кто (относительное слово)',meaningEn:'that, which, who',forms:[
    {p:'שֶׁ',tr:'ше',tag:'plain',ruleRu:'относительное слово',ruleEn:'relative word'}
  ]},
  {id:'ה',nameRu:'hей',nameEn:'he',meaningRu:'определённый артикль (the)',meaningEn:'the (definite article)',forms:[
    {p:'הַ',tr:'ха',tag:'article',ruleRu:'обычная форма; следующая буква удваивается',ruleEn:'default form; the next letter is doubled'},
    {p:'הָ',tr:'ха',tag:'article',ruleRu:'перед א/ע',ruleEn:'before א/ע'}
  ]},
  {id:'ו',nameRu:'вав',nameEn:'vav',meaningRu:'и, а',meaningEn:'and',forms:[
    {p:'וְ',tr:'ве',tag:'plain',ruleRu:'обычная форма; с артиклем וְהַ',ruleEn:'default form; with the article וְהַ'},
    {p:'וּ',tr:'у',tag:'u',ruleRu:'перед ב, מ, פ и перед шва',ruleEn:'before ב, מ, פ and before shva'},
    {p:'וִ',tr:'ви',tag:'yod',ruleRu:'перед י со шва',ruleEn:'before י with shva'},
    {p:'וַ',tr:'ва',tag:'plain',noQuiz:true,ruleRu:'перед хатаф-патах, например וַאֲנִי «и я»; только справочник',ruleEn:'before hataf-patah, e.g. וַאֲנִי “and I”; reference only'}
  ]},
  {id:'כ',nameRu:'каф',nameEn:'kaf',meaningRu:'как, подобно; около',meaningEn:'like, as; about',forms:[
    {p:'כְּ',tr:'ке',tag:'plain',ruleRu:'обычная форма',ruleEn:'default form'},
    {p:'כַּ',tr:'ка',tag:'article',ruleRu:'с артиклем',ruleEn:'with the article'},
    {p:'כָּ',tr:'ка',tag:'article',ruleRu:'с артиклем перед א/ע',ruleEn:'with the article before א/ע'},
    {p:'כִּ',tr:'ки',tag:'sheva',ruleRu:'перед шва; перед י со шва',ruleEn:'before shva; before י with shva'}
  ]},
  {id:'ל',nameRu:'ламед',nameEn:'lamed',meaningRu:'к, для, в (куда); кому',meaningEn:'to, for',forms:[
    {p:'לְ',tr:'ле',tag:'plain',ruleRu:'обычная форма',ruleEn:'default form'},
    {p:'לַ',tr:'ла',tag:'article',ruleRu:'с артиклем',ruleEn:'with the article'},
    {p:'לָ',tr:'ла',tag:'article',ruleRu:'с артиклем перед א/ע',ruleEn:'with the article before א/ע'},
    {p:'לִ',tr:'ли',tag:'sheva',ruleRu:'перед шва; перед י со шва',ruleEn:'before shva; before י with shva'}
  ]},
  {id:'ב',nameRu:'бет',nameEn:'bet',meaningRu:'в, на, при; с помощью',meaningEn:'in, at, on; by means of',forms:[
    {p:'בְּ',tr:'бе',tag:'plain',ruleRu:'обычная форма',ruleEn:'default form'},
    {p:'בַּ',tr:'ба',tag:'article',ruleRu:'с артиклем',ruleEn:'with the article'},
    {p:'בָּ',tr:'ба',tag:'article',ruleRu:'с артиклем перед א/ע',ruleEn:'with the article before א/ע'},
    {p:'בִּ',tr:'би',tag:'sheva',ruleRu:'перед шва; перед י со шва',ruleEn:'before shva; before י with shva'}
  ]}
];
PREFIXES.forEach(function(p){p.forms.forEach(function(f){f.trEn=romanize(f.tr);});});
// ru is the nominative; the three case forms below it are what the Russian
// glosses need after в (prepositional), к (dative) and из (genitive).
const PFX_WORDS=[
  {id:'bayit',p:'בַּיִת',u:'בית',tr:'байт',ru:'дом',gen:'дома',dat:'дому',prep:'доме',en:'house',article:true},
  {id:'sefer',p:'סֵפֶר',u:'ספר',tr:'сефер',ru:'книга',gen:'книги',dat:'книге',prep:'книге',en:'book',article:true},
  {id:'yeled',p:'יֶלֶד',u:'ילד',tr:'елед',ru:'ребёнок',gen:'ребёнка',dat:'ребёнку',prep:'ребёнке',en:'child',article:true},
  {id:'perach',p:'פֶּרַח',u:'פרח',tr:'перах',ru:'цветок',gen:'цветка',dat:'цветку',prep:'цветке',en:'flower',article:true},
  {id:'medina',p:'מְדִינָה',u:'מדינה',tr:'мдина',ru:'страна',gen:'страны',dat:'стране',prep:'стране',en:'country',article:true},
  {id:'yerushalayim',p:'יְרוּשָׁלַיִם',u:'ירושלים',tr:'ирушалайим',ru:'Иерусалим',gen:'Иерусалима',dat:'Иерусалиму',prep:'Иерусалиме',en:'Jerusalem',article:false},
  {id:'adam',p:'אָדָם',u:'אדם',tr:'адам',ru:'человек',gen:'человека',dat:'человеку',prep:'человеке',en:'person',article:true},
  {id:'ir',p:'עִיר',u:'עיר',tr:'ир',ru:'город',gen:'города',dat:'городу',prep:'городе',en:'city',article:true}
];
const PFX_TABLE=[
  {wordId:'bayit',rows:{
    'ב':['בְּבַיִת [בְּ] {plain} бевайт','בַּבַּיִת [בַּ] {article} бабайт'],
    'ל':['לְבַיִת [לְ] {plain} левайт','לַבַּיִת [לַ] {article} лабайт'],
    'כ':['כְּבַיִת [כְּ] {plain} кевайт','כַּבַּיִת [כַּ] {article} кабайт'],
    'מ':['מִבַּיִת [מִ] {plain} мибайт','מֵהַבַּיִת [מֵהַ] {article} меhабайт'],
    'ו':['וּבַיִת [וּ] {u} увайт','וְהַבַּיִת [וְ] {article} веhабайт'],
    'ה':[null,'הַבַּיִת [הַ] {article} хабайт']
  }},
  {wordId:'sefer',rows:{
    'ב':['בְּסֵפֶר [בְּ] {plain} бесефер','בַּסֵּפֶר [בַּ] {article} басефер'],
    'ל':['לְסֵפֶר [לְ] {plain} лесефер','לַסֵּפֶר [לַ] {article} ласефер'],
    'כ':['כְּסֵפֶר [כְּ] {plain} кесефер','כַּסֵּפֶר [כַּ] {article} касефер'],
    'מ':['מִסֵּפֶר [מִ] {plain} мисефер','מֵהַסֵּפֶר [מֵהַ] {article} меhасефер'],
    'ו':['וְסֵפֶר [וְ] {plain} весефер','וְהַסֵּפֶר [וְ] {article} веhасефер'],
    'ה':[null,'הַסֵּפֶר [הַ] {article} хасефер']
  }},
  {wordId:'yeled',rows:{
    'ב':['בְּיֶלֶד [בְּ] {plain} бейелед','בַּיֶּלֶד [בַּ] {article} байелед'],
    'ל':['לְיֶלֶד [לְ] {plain} лейелед','לַיֶּלֶד [לַ] {article} лайелед'],
    'כ':['כְּיֶלֶד [כְּ] {plain} кейелед','כַּיֶּלֶד [כַּ] {article} кайелед'],
    'מ':['מִיֶּלֶד [מִ] {plain} мийелед','מֵהַיֶּלֶד [מֵהַ] {article} меhайелед'],
    'ו':['וְיֶלֶד [וְ] {plain} вейелед','וְהַיֶּלֶד [וְ] {article} веhайелед'],
    'ה':[null,'הַיֶּלֶד [הַ] {article} хайелед']
  }},
  {wordId:'perach',rows:{
    'ב':['בְּפֶרַח [בְּ] {plain} беферах','בַּפֶּרַח [בַּ] {article} баперах'],
    'ל':['לְפֶרַח [לְ] {plain} леферах','לַפֶּרַח [לַ] {article} лаперах'],
    'כ':['כְּפֶרַח [כְּ] {plain} кеферах','כַּפֶּרַח [כַּ] {article} каперах'],
    'מ':['מִפֶּרַח [מִ] {plain} миперах','מֵהַפֶּרַח [מֵהַ] {article} меhаперах'],
    'ו':['וּפֶרַח [וּ] {u} уперах','וְהַפֶּרַח [וְ] {article} веhаперах'],
    'ה':[null,'הַפֶּרַח [הַ] {article} хаперах']
  }},
  {wordId:'medina',rows:{
    'ב':['בִּמְדִינָה [בִּ] {sheva} бимдина','בַּמְּדִינָה [בַּ] {article} бамедина'],
    'ל':['לִמְדִינָה [לִ] {sheva} лимдина','לַמְּדִינָה [לַ] {article} ламедина'],
    'כ':['כִּמְדִינָה [כִּ] {sheva} кимдина','כַּמְּדִינָה [כַּ] {article} камедина'],
    'מ':['מִמְּדִינָה [מִ] {sheva} мимдина','מֵהַמְּדִינָה [מֵהַ] {article} меhамедина'],
    'ו':['וּמְדִינָה [וּ] {u} умдина','וְהַמְּדִינָה [וְ] {article} веhамедина'],
    'ה':[null,'הַמְּדִינָה [הַ] {article} хамедина']
  }},
  {wordId:'yerushalayim',rows:{
    'ב':['בִּירוּשָׁלַיִם [בִּ] {yod} бирушалайим',null],
    'ל':['לִירוּשָׁלַיִם [לִ] {yod} лирушалайим',null],
    'כ':['כִּירוּשָׁלַיִם [כִּ] {yod} кирушалайим',null],
    'מ':['מִירוּשָׁלַיִם [מִ] {yod} мирушалайим',null],
    'ו':['וִירוּשָׁלַיִם [וִ] {yod} вирушалайим',null]
  }},
  {wordId:'adam',rows:{
    'ב':['בְּאָדָם [בְּ] {plain} беадам','בָּאָדָם [בָּ] {article} баадам'],
    'ל':['לְאָדָם [לְ] {plain} леадам','לָאָדָם [לָ] {article} лаадам'],
    'כ':['כְּאָדָם [כְּ] {plain} кеадам','כָּאָדָם [כָּ] {article} каадам'],
    'מ':['מֵאָדָם [מֵ] {guttural} меадам','מֵהָאָדָם [מֵהָ] {article} меhаадам'],
    'ו':['וְאָדָם [וְ] {plain} веадам','וְהָאָדָם [וְ] {article} веhаадам'],
    'ה':[null,'הָאָדָם [הָ] {article} хаадам']
  }},
  {wordId:'ir',rows:{
    'ב':['בְּעִיר [בְּ] {plain} беир','בָּעִיר [בָּ] {article} баир'],
    'ל':['לְעִיר [לְ] {plain} леир','לָעִיר [לָ] {article} лаир'],
    'כ':['כְּעִיר [כְּ] {plain} кеир','כָּעִיר [כָּ] {article} каир'],
    'מ':['מֵעִיר [מֵ] {guttural} меир','מֵהָעִיר [מֵהָ] {article} меhаир'],
    'ו':['וְעִיר [וְ] {plain} веир','וְהָעִיר [וְ] {article} веhаир'],
    'ה':[null,'הָעִיר [הָ] {article} хаир']
  }}
];
const PFX_COMBOS=[
  {id:'c1',prefixes:['ו','ב','ה'],p:'וּבַבַּיִת',tr:'увабайт',word:'בית',wordP:'בַּיִת',art:true,ru:'и в доме',en:'and in the house'},
  {id:'c2',prefixes:['ו','ל','ה'],p:'וְלַיֶּלֶד',tr:'велайелед',word:'ילד',wordP:'יֶלֶד',art:true,ru:'и ребёнку',en:'and to the child'},
  {id:'c3',prefixes:['ו','מ','ה'],p:'וּמֵהַסֵּפֶר',tr:'умеhасефер',word:'ספר',wordP:'סֵפֶר',art:true,ru:'и из книги',en:'and from the book'},
  {id:'c4',prefixes:['ו','כ','ה'],p:'וְכָאָדָם',tr:'векаадам',word:'אדם',wordP:'אָדָם',art:true,ru:'и как человек',en:'and like a person'},
  {id:'c5',prefixes:['ו','ל','ה'],p:'וְלָעִיר',tr:'велаир',word:'עיר',wordP:'עִיר',art:true,ru:'и в город',en:'and to the city'},
  {id:'c6',prefixes:['ש','ב','ה'],p:'שֶׁבַּבַּיִת',tr:'шебабайт',word:'בית',wordP:'בַּיִת',art:true,ru:'что в доме',en:'that is in the house'},
  {id:'c7',prefixes:['ו','ב'],p:'וּבִירוּשָׁלַיִם',tr:'увирушалайим',word:'ירושלים',wordP:'יְרוּשָׁלַיִם',art:false,ru:'и в Иерусалиме',en:'and in Jerusalem'}
];
const PFX_PHRASES=[
  {id:1,he:'אני גר ___.',answer:'בִּירוּשָׁלַיִם',ru:'Я живу в Иерусалиме',en:'I live in Jerusalem',tag:'yod'},
  {id:2,he:'הספר נמצא ___.',answer:'בַּבַּיִת',ru:'Книга лежит в (этом) доме',en:'The book is in the house',tag:'article'},
  {id:3,he:'הוא יצא ___.',answer:'מֵהַבַּיִת',ru:'Он вышел из дома',en:'He left the house',tag:'article'},
  {id:4,he:'אנחנו נוסעים ___.',answer:'לָעִיר',ru:'Мы едем в город',en:'We are travelling to the city',tag:'article'},
  {id:5,he:'אני נותן את זה ___.',answer:'לַיֶּלֶד',ru:'Я даю это ребёнку',en:'I give this to the child',tag:'article'},
  {id:6,he:'הוא מדבר ___.',answer:'כְּיֶלֶד',ru:'Он говорит как ребёнок',en:'He talks like a child',tag:'plain'},
  {id:7,he:'אני יודע ___ בא.',answer:'שֶׁהוּא',ru:'Я знаю, что он пришёл',en:'I know that he came',tag:'pron'},
  {id:8,he:'הם גרים ___.',answer:'בַּמְּדִינָה',ru:'Они живут в (этой) стране',en:'They live in the country',tag:'article'},
  {id:9,he:'הוא קרא ___.',answer:'מֵהַסֵּפֶר',ru:'Он читал из книги',en:'He read from the book',tag:'article'},
  {id:10,he:'ראיתי ילד ___.',answer:'וּפֶרַח',ru:'Я видел ребёнка и цветок',en:'I saw a child and a flower',tag:'u'},
  {id:11,he:'הוא בא ___.',answer:'מִירוּשָׁלַיִם',ru:'Он пришёл из Иерусалима',en:'He came from Jerusalem',tag:'yod'},
  {id:12,he:'הוא מאמין ___.',answer:'בָּאָדָם',ru:'Он верит в человека',en:'He believes in people',tag:'article'},
  {id:13,he:'הם באו ___.',answer:'מֵהָעִיר',ru:'Они пришли из города',en:'They came from the city',tag:'article'},
  {id:14,he:'אני יודע ___ יש אור.',answer:'שֶׁבַּבַּיִת',ru:'Я знаю, что в доме есть свет',en:'I know that there is light in the house',tag:'combo'}
];
const PFX_TRAPS=[
  {ru:'ב/ל/כ + артикль: ה исчезает, а в тексте без огласовок «в доме» и «в каком-то доме» пишутся одинаково (בבית), разницу даёт огласовка (בְּבַיִת / בַּבַּיִת).',en:'ב/ל/כ + article: ה disappears, and without niqqud “in the house” and “in a house” look the same (בבית); niqqud shows the difference (בְּבַיִת / בַּבַּיִת).'},
  {ru:'מ + ה пишется как מה: מהבית.',en:'מ + ה is written מה: מהבית.'},
  {ru:'ש (что) и של (принадлежность) не путать.',en:'Do not confuse ש (that) and של (belonging).'},
  {ru:'ו становится וּ перед ב, מ, פ и перед шва.',en:'ו becomes וּ before ב, מ, פ and before shva.'},
  {ru:'ה-артикль не путать с ה-вопросительной/буквой слова.',en:'Do not confuse the article ה with interrogative ה or a letter of the word.'}
];
const PFX_ITEMS=[];
const PFX_BY_ID={};
// Russian has no article, so both the bare noun and the definite one read the
// same there; the difference stays visible in English and in the Hebrew form.
function pfxGloss(prefix,word,art){
  if(prefix==='ה') return {ru:'определённый артикль: '+word.ru,en:'the '+word.en};
  const ru={'ב':'в '+word.prep,'ל':'к '+word.dat,'כ':'как '+word.ru,'מ':'из '+word.gen,'ו':'и '+word.ru,'ש':'что/который'}[prefix];
  const noun=(art?'the ':'a ')+word.en;
  const en={'ב':'in '+noun,'ל':'to '+noun,'כ':'like '+noun,'מ':'from '+noun,'ו':'and '+noun,'ש':'that/which'}[prefix];
  if(!ru||!en) return {ru:word.ru,en:word.en};
  return {ru:ru,en:en};
}
function pfxRuleFor(prefix,pfxForm,tag){
  const p=PREFIXES.find(function(x){return x.id===prefix;});
  if(!p) return {ru:'',en:''};
  const f=p.forms.find(function(x){return x.p===pfxForm;})||p.forms.find(function(x){return x.tag===tag;})||p.forms[0];
  return {ru:f.ruleRu,en:f.ruleEn};
}
// The transliterations are written in Russian letters; English shows the
// romanised twin, the same way prepositions and pronouns already do.
function addPfxItem(it){it.trEn=romanize(it.tr);PFX_ITEMS.push(it);PFX_BY_ID[it.id]=it;}
PFX_TABLE.forEach(function(row){
  const w=PFX_WORDS.find(function(x){return x.id===row.wordId;});
  if(!w) return;
  Object.keys(row.rows).forEach(function(prefix){
    row.rows[prefix].forEach(function(raw){
      if(!raw||raw==='—') return;
      const m=raw.match(/^(\S+)\s+\[(\S+)\]\s+\{(\w+)\}\s+(.+)$/);
      if(!m) return;
      const tag=m[3];
      const art=tag==='article';
      const gl=pfxGloss(prefix,w,art);
      const rule=pfxRuleFor(prefix,m[2],tag);
      addPfxItem({id:'w_'+w.id+'_'+prefix+'_'+(art?'art':'plain'),prefix:prefix,prefixes:[prefix],p:m[1],u:stripNikud(m[1]),tr:m[4],word:w.u,wordP:w.p,art:art,pfxForm:m[2],tag:tag,group:prefix+'|'+w.u,key:'pfx:'+prefix+':'+tag,glossRu:gl.ru,glossEn:gl.en,ruleRu:rule.ru,ruleEn:rule.en});
    });
  });
});
PFX_COMBOS.forEach(function(c){
  addPfxItem({id:'combo_'+c.id,prefix:c.prefixes[0],prefixes:c.prefixes.slice(),p:c.p,u:stripNikud(c.p),tr:c.tr,word:c.word,wordP:c.wordP,art:c.art,pfxForm:c.prefixes.join(''),tag:'combo',group:'combo|'+c.id,key:'pfx:'+c.prefixes[0]+':combo',glossRu:c.ru,glossEn:c.en,ruleRu:'несколько приставок',ruleEn:'several prefixes'});
});
PRONOUNS.forEach(function(pr){
  const p='שֶׁ'+pr.p;
  addPfxItem({id:'pron_'+pr.role,prefix:'ש',prefixes:['ש'],p:p,u:stripNikud(p),tr:'ше'+pr.t,word:pr.u,wordP:pr.p,art:false,pfxForm:'שֶׁ',tag:'pron',group:'pron',key:'pfx:ש:pron',glossRu:'что/который: '+ROLE_LABEL_RU[pr.role],glossEn:'that/which: '+ROLE_LABEL_EN[pr.role],ruleRu:'ש + местоимение',ruleEn:'ש + pronoun'});
});

const KEY_ENDINGS={
  '1s':['י'],'2ms':['ך'],'2fs':['ך'],'3ms':['ו'],'3fs':['ה'],
  '1p':['נו'],'2mp':['כם'],'2fp':['כן'],'3mp':['הם','ם'],'3fp':['הן','ן']
};

const FRAMES=[
  {id:'yesh',he:'יֵשׁ ___',prep:'l',group:'exist',ru:'есть у…',en:'there is (to/for)…'},
  {id:'eyn',he:'אֵין ___',prep:'l',group:'exist',ru:'нет у…',en:'there is no (to/for)…'},
  {id:'kar',he:'קַר ___',prep:'l',group:'state',ru:'холодно',en:'cold to…'},
  {id:'cham',he:'חַם ___',prep:'l',group:'state',ru:'жарко',en:'hot to…'},
  {id:'kashe',he:'קָשֶׁה ___',prep:'l',group:'state',ru:'трудно',en:'hard to…'},
  {id:'hashuv',he:'חָשׁוּב ___',prep:'l',group:'state',ru:'важно',en:'important to…'},
  {id:'ba',he:'בָּא ___',prep:'l',group:'state',ru:'хочется (букв. «приходит мне»)',en:'feel like (lit. “comes to me”)'},
  {id:'ichpat',he:'אִכְפַּת ___',prep:'l',group:'state',ru:'мне не всё равно',en:'I care / it matters to…'},
  {id:'nimas',he:'נִמְאַס ___',prep:'l',group:'state',ru:'надоело',en:'fed up to…'},
  {id:'koev',he:'כּוֹאֵב ___',prep:'l',group:'state',ru:'болит',en:'hurts to…'},
  {id:'mechake',he:'מְחַכֶּה ___',prep:'l',group:'verb',trap:true,ru:'ждать кого',en:'waiting for someone'},
  {id:'medaber',he:'מְדַבֵּר ___',prep:'im',group:'verb',ru:'говорить с кем',en:'talking with someone'},
  {id:'choshev',he:'חוֹשֵׁב ___',prep:'al',group:'verb',ru:'думать о ком',en:'thinking about someone'},
  {id:'mitgaagea',he:'מִתְגַּעְגֵּעַ ___',prep:'el',group:'verb',trap:true,ru:'скучать по кому',en:'missing someone'},
  {id:'mefached',he:'מְפַחֵד ___',prep:'min',group:'verb',trap:true,ru:'бояться кого',en:'afraid of someone'},
  {id:'somech',he:'סוֹמֵךְ ___',prep:'al',group:'verb',ru:'полагаться на кого',en:'relying on someone'},
  {id:'ohev',he:'אוֹהֵב ___',prep:'et',group:'verb',ru:'любить кого',en:'loving someone'},
  {id:'shoel',he:'שׁוֹאֵל ___',prep:'et',group:'verb',ru:'спрашивать кого',en:'asking someone'},
  {id:'ozer',he:'עוֹזֵר ___',prep:'l',group:'verb',ru:'помогать кому',en:'helping someone'},
  {id:'maamin',he:'מַאֲמִין ___',prep:'b',group:'verb',ru:'верить в кого',en:'believing in someone'},
  {id:'mistakel',he:'מִסְתַּכֵּל ___',prep:'al',group:'verb',ru:'смотреть на кого',en:'looking at someone'},
  {id:'nifgash',he:'נִפְגָּשׁ ___',prep:'im',group:'verb',ru:'встречаться с кем',en:'meeting with someone'},
  {id:'makshiv',he:'מַקְשִׁיב ___',prep:'l',group:'verb',trap:true,ru:'слушать кого',en:'listening to someone'},
  {id:'mode',he:'מוֹדֶה ___',prep:'l',group:'verb',trap:true,ru:'благодарить кого',en:'thanking someone'},
  {id:'mevakesh',he:'מְבַקֵּשׁ ___',prep:'min',group:'verb',trap:true,ru:'просить у кого',en:'asking someone (for)'},
  {id:'maskim',he:'מַסְכִּים ___',prep:'im',group:'verb',ru:'соглашаться с кем',en:'agreeing with someone'},
  {id:'cholem',he:'חוֹלֵם ___',prep:'al',group:'verb',ru:'мечтать о ком',en:'dreaming about someone'},
  {id:'doeg',he:'דוֹאֵג ___',prep:'l',group:'verb',ru:'заботиться о ком',en:'worrying about someone'}
];
const FRAMES_BY_ID={};
FRAMES.forEach(function(f){FRAMES_BY_ID[f.id]=f;});

const SENTENCES=[
  {id:1,he:'אני מחכה ___ כבר שעה.',ru:'Я жду тебя (м.) уже час.',en:'I have been waiting for you (m.) for an hour already.',prep:'l',role:'2ms',trap:true},
  {id:2,he:'היא מדברת ___ כל יום.',ru:'Она разговаривает с ним каждый день.',en:'She talks with him every day.',prep:'im',role:'3ms'},
  {id:3,he:'הוא חושב ___ כל הזמן.',ru:'Он думает о ней всё время.',en:'He thinks about her all the time.',prep:'al',role:'3fs'},
  {id:4,he:'אנחנו מאוד אוהבים ___.',ru:'Мы очень любим их (м.).',en:'We love them (m.) very much.',prep:'et',role:'3mp'},
  {id:5,he:'יש ___ זמן?',ru:'У тебя (ж.) есть время?',en:'Do you (f.) have time?',prep:'l',role:'2fs'},
  {id:6,he:'קר ___ בחדר הזה.',ru:'Мне холодно в этой комнате.',en:'I am cold in this room.',prep:'l',role:'1s'},
  {id:7,he:'אני מפחד ___.',ru:'Я боюсь тебя (м.).',en:'I am afraid of you (m.).',prep:'min',role:'2ms',trap:true},
  {id:8,he:'הספר הזה ___.',ru:'Эта книга моя.',en:'This book is mine.',prep:'shel',role:'1s'},
  {id:9,he:'אין ___ כסף.',ru:'У нас нет денег.',en:'We have no money.',prep:'l',role:'1p'},
  {id:10,he:'אני סומך ___.',ru:'Я полагаюсь на вас (м.).',en:'I rely on you pl. (m.).',prep:'al',role:'2mp'},
  {id:11,he:'הפרחים האלה ___.',ru:'Эти цветы для неё.',en:'These flowers are for her.',prep:'bishvil',role:'3fs'},
  {id:12,he:'בא ___ לאכול משהו.',ru:'Мне хочется что-нибудь съесть.',en:'I feel like eating something.',prep:'l',role:'1s'},
  {id:13,he:'אני מתגעגע ___.',ru:'Я скучаю по тебе (ж.).',en:'I miss you (f.).',prep:'el',role:'2fs',trap:true},
  {id:14,he:'הוא שאל ___ אם אני בסדר.',ru:'Он спросил меня, в порядке ли я.',en:'He asked me if I was okay.',prep:'et',role:'1s'},
  {id:15,he:'הערב אני ישן ___.',ru:'Сегодня вечером я ночую у него.',en:'Tonight I am sleeping at his place.',prep:'etsel',role:'3ms'},
  {id:16,he:'אפשר לשבת ___?',ru:'Можно присесть с вами (м.)?',en:'May I sit with you pl. (m.)?',prep:'im',role:'2mp'},
  {id:17,he:'אכפת ___ שאפתח חלון?',ru:'Ты (м.) не против, если я открою окно?',en:'Do you (m.) mind if I open a window?',prep:'l',role:'2ms'},
  {id:18,he:'שמעתי ___ בחדשות.',ru:'Я слышал о них (м.) в новостях.',en:'I heard about them (m.) on the news.',prep:'al',role:'3mp'},
  {id:19,he:'אני מאמין ___.',ru:'Я верю в тебя (м.).',en:'I believe in you (m.).',prep:'b',role:'2ms'},
  {id:20,he:'הם ביקשו ___ עזרה.',ru:'Они попросили у нас помощи.',en:'They asked us for help.',prep:'min',role:'1p',trap:true},
  {id:21,he:'אני מודה ___.',ru:'Я благодарю вас (ж.). Разг. также לכם.',en:'I thank you pl. (f.). Colloquially also לכם.',prep:'l',role:'2fp',trap:true},
  {id:22,he:'תתקשר ___ מחר.',ru:'Позвони мне завтра.',en:'Call me tomorrow.',prep:'el',role:'1s'},
  {id:23,he:'הוא נפגש ___ אתמול.',ru:'Он встретился с ней вчера.',en:'He met with her yesterday.',prep:'im',role:'3fs'}
];

const TRAPS=[
  {ru:'Ждать и слушать кого, благодарить кого, помогать кому — в иврите всё это ל: מחכה לך, מקשיב לך, מודה לך, עוזר לך.',en:'Wait for, listen to, thank and help someone — Hebrew uses ל for all of them: מחכה לך, מקשיב לך, מודה לך, עוזר לך.'},
  {ru:'Бояться и просить (у) — מ: מפחד ממך, מבקש ממך.',en:'Fear and ask (from) — מ: מפחד ממך, מבקש ממך.'},
  {ru:'Скучать по — אל; думать, мечтать, полагаться (о/на) — על.',en:'Miss someone — אל; think, dream, rely (about/on) — על.'},
  {ru:'«У меня есть» = יש לי (ל), а «у него дома» = אצלו (אצל). Это разные «у».',en:'“I have” = יש לי (ל), but “at his place” = אצלו (אצל). Different “at”.'},
  {ru:'«Хочется» = בא לי (буквально «приходит мне»); «мне холодно» = קר לי.',en:'“I feel like” = בא לי (lit. “comes to me”); “I am cold” = קר לי.'},
  {ru:'Род во 2-м лице (и «ты», и «вы»), которого нет в русском.',en:'Second-person gender (both “you” singular and plural) does not exist in Russian.'},
  {ru:'את как маркер объекта (бывает только перед определённым дополнением) ≠ את «ты (ж.)».',en:'את as an object marker (only before a definite object) ≠ את “you (f.)”.'},
  {ru:'Омографы: לך (м.)/לך (ж.), אותך/אותך и т. д. различаются только огласовкой и ударением.',en:'Homographs: לך (m.)/לך (f.), אותך/אותך etc. differ only in niqqud and stress.'},
  {ru:'אתם/אתן, הם/הן: в живой речи женские формы множественного числа почти исчезли.',en:'אתם/אתן, הם/הן: in speech the feminine plural forms have almost disappeared.'}
];

const PEOPLE={
  ron:{id:'ron',ru:'Рон',en:'Ron',g:'m',emoji:'👨',members:['ron']},
  dana:{id:'dana',ru:'Дана',en:'Dana',g:'f',emoji:'👩',members:['dana']},
  noa:{id:'noa',ru:'Ноа',en:'Noa',g:'f',emoji:'👩',members:['noa']},
  group:{id:'group',ru:'Рон и Дана',en:'Ron and Dana',g:'m',emoji:'👥',members:['ron','dana']}
};

const LS_LANG='hebrewpron_lang_v1';
const LS_STATS='hebrewpron_stats_v1';
const LS_SETTINGS='hebrewpron_settings_v1';
const LS_KB='hebrewpron_kb_v1';
const LS_BEST='hebrewpron_best_v1';
const LS_THEME='hebrew_theme_v1';

const I18N={
  ru:{
    appTitle:'Иврит · Местоимения',tabMap:'Карта',tabPath:'Путь',tabTrain:'Тренировка',tabPhrases:'Фразы',
    mapSubRoles:'Роли',mapSubKey:'Ключ',mapSubPreps:'Предлоги',mapSubHeat:'Тепловая карта',mapSubTraps:'Ловушки',
    rolesTitle:'10 ролей',rolesIntro:'Местоимение — это перспектива, а не слово. Одна роль всегда одного цвета. Род и число показаны формой и подписью.',
    keyTitle:'Ключ окончаний',keyIntro:'Десять окончаний общие почти для всех предлогов. Меняется только основа.',
    keyRuleTitle:'Правило',keyRuleText:'-הם после гласной основы (ל, ב, של, על, אל, מ), -ם после согласной (את, עם, אצל, בשביל). Так же -הן / -ן.',
    familiesTitle:'Семейства предлогов',familySimple:'простые: ל, ב, של',familyYod:'на -י-: על, אל',familyConsonant:'на согласную: את, עם, אצל, בשביל',familyIrregular:'нерегулярное: מ',
    examplesTitle:'Примеры на трёх предлогах',prepsTitle:'Предлоги с окончаниями',prepsIntro:'Основа нейтрального цвета, окончание — цветом роли. Нажми 🔊, чтобы услышать форму.',
    heatTitle:'Тепловая карта',heatIntro:'Строки — роли, столбцы — предлоги. Нажми на клетку, чтобы увидеть форму и статистику.',
    heatNoData:'нет данных',trapsTitle:'Ловушки русского',trapsIntro:'Где русский падеж или предлог не совпадает с ивритским.',
    pathTitle:'Путь',pathIntro:'Уровни идут от ролей к предлогам, кадрам и скорости. По умолчанию доступно всё; «Строгий путь» закрывает следующий уровень до 70% предыдущего.',
    levelLocked:'Откроется после 70% предыдущего уровня',levelStart:'Начать',
    filterPreps:'Предлоги',filterFrames:'Кадры',filterRoles:'Роли',filterWeak:'Только слабые',filterNotAuto:'Только не в автомате',filterReset:'Сбросить фильтры',
    framesExist:'есть/нет/состояния',framesVerbs:'глаголы',
    person1:'1-е лицо',person2:'2-е лицо',person3:'3-е лицо',numS:'ед.',numP:'мн.',genM:'м.',genF:'ж.',
    modeBuild:'Собери',modeRole2Form:'Роль → форма',modeForm2Role:'Форма → роль',modePerspective:'Перспектива',modeRun:'Прогон',modeSpeed:'Скорость',modeKeyMini:'Ключ-мини',modeListen:'На слух',
    check:'Проверить',hint:'Подсказка',show:'Показать',next:'Дальше',start:'Начать',again:'Ещё раз',
    correct:'Верно!',wrong:'Неверно',answerWas:'Правильный ответ:',bothCorrect:'обе верны:',colloqAlso:'разг.: также',
    score:'Очки',streak:'Серия',best:'Рекорд',chooseStem:'Основа',chooseEnd:'Окончание',wholeForm:'Выбери целую форму',
    runChooseFrame:'Выбери кадр',runStart:'Начать прогон',runTime:'Время',runErrors:'Ошибки',runBest:'Лучшее время',runNewRecord:'Новый рекорд!',runDone:'Прогон завершён',
    speedStart:'Начать 60 секунд',speedTime:'Осталось',speedCorrect:'Верных',speedBest:'Рекорд',speedNewRecord:'Новый рекорд!',speedDone:'Время вышло',
    listenUnavailable:'Озвучка недоступна в этом браузере',listenReplay:'Повторить',listenChooseRole:'Какая это роль?',
    phrasesTitle:'Фразы',phraseModeChoice:'Выбор',phraseModeType:'Набор',phraseHint:'Подсказка',phraseTrap:'Ловушка русского',phraseNext:'Дальше',phraseRead:'Прочитать',
    settingsTitle:'Настройки',nikudLabel:'Огласовки',nikudAlways:'Всегда',nikudHint:'По подсказке',nikudOff:'Выключены',translitLabel:'Транслитерация',registerLabel:'Регистр',registerColloq:'Разговорный',registerStrict:'Строгий стандарт',soundLabel:'Звук',strictPathLabel:'Строгий путь',exportLabel:'Экспорт прогресса',importLabel:'Импорт прогресса',resetLabel:'Сбросить прогресс',resetConfirm:'Сбросить весь прогресс? Настройки, тема и язык останутся.',close:'Закрыть',saved:'Сохранено',importError:'Не удалось прочитать файл',imported:'Прогресс импортирован',
    themeDark:'Тёмная тема',themeLight:'Светлая тема',keyboardTitle:'Клавиатура',keyboardHide:'Скрыть клавиатуру',ttsNoVoice:'Еврейский голос не найден — озвучка скрыта',irregularForm:'нерегулярная форма',resetDone:'Прогресс сброшен',exportError:'Не удалось сохранить файл',
    noData:'—',attempts:'попыток',accuracy:'точность',avgTime:'среднее время',fastStreak:'быстрая серия',mastered:'освоено',auto:'в автомате',of:'из',
    hintRu:'Русский перевод',trapCard:'Ловушка русского',settingsSaved:'Настройки сохранены',exported:'Файл сохранён',frameBlank:'___',
    speakerSays:'говорит',targetIs:'Кому/о ком речь:',perspectiveIntro:'Роль зависит от того, кто смотрит.',weakEmpty:'Нет элементов по этому фильтру',noVoiceHidden:'Озвучка скрыта: нет еврейского голоса',
    importPrompt:'Выбери JSON-файл прогресса',endingLabel:'Окончание',roleLabel:'Роль',prepLabel:'Предлог',formLabel:'Форма',statsLabel:'Статистика',
    roleQuestion:'Какая роль?',pronQuestion:'Какое местоимение?',endingQuestion:'Какое окончание?',listenQuestion:'Послушай и выбери роль',buildQuestion:'Собери форму',chooseForm:'Выбери форму',
    tabPrefix:'Приставки',
    pfxSubRef:'Справочник',pfxSubTrain:'Тренажёр',pfxSubMap:'Карта',
    pfxMnemonicTitle:'משה וכלב — Моше и Калев',pfxMnemonicIntro:'Семь букв-приставок в порядке мнемоники. Тап по плитке — формы и примеры.',
    pfxRulesTitle:'Правила',pfxTrapsTitle:'Ловушки',
    pfxTrainTitle:'Тренажёр приставок',pfxFilters:'Фильтры',
    pfxFilterPrefixes:'Приставки',pfxFilterTags:'Условие',pfxFilterForms:'Форма',pfxFilterWeak:'Только слабые',pfxFilterNotAuto:'Только не в автомате',pfxFilterReset:'Сбросить фильтры',
    pfxModeLetter:'Буква → значение',pfxModeBuild:'Собери слово',pfxModeForm:'Какая форма?',pfxModeParse:'Разбор',pfxModeSpeed:'Скорость',pfxModePhrases:'Фразы',
    pfxLetterQuestion:'Что означает эта приставка?',pfxMeaningQuestion:'Какая это приставка?',pfxBuildQuestion:'Собери слово',pfxFormQuestion:'Какая форма приставки?',pfxParseQuestion:'Выбери разбор',
    pfxArticle:'с артиклем',pfxNoArticle:'без артикля',pfxPrefixLabel:'Приставка',pfxWordLabel:'Слово',pfxRuleLabel:'Правило',pfxExamples:'Примеры',
    pfxBuildNote:'Без огласовок «с артиклем» и «без артикля» у ב/ל/כ пишутся одинаково — добавляй огласовку.',pfxEmpty:'Нет элементов по этому фильтру',
    pfxSpeedStart:'Начать 60 секунд',pfxSpeedDone:'Время вышло',pfxSpeedCorrect:'Верных',pfxSpeedBest:'Рекорд',pfxSpeedNewRecord:'Новый рекорд!',
    pfxPhrasesTitle:'Фразы с приставками',pfxPhraseChoice:'Выбор',pfxPhraseType:'Набор',pfxPhraseHint:'Подсказка',pfxPhraseNext:'Дальше',
    pfxHeatTitle:'Карта приставок',pfxHeatIntro:'Строки — приставки, столбцы — условия. Тап по клетке — примеры и статистика.',pfxProgress:'Прогресс приставок',pfxMastered:'освоено',
    pfxTagPlain:'обычная форма',pfxTagArticle:'с артиклем ה',pfxTagSheva:'перед шва',pfxTagYod:'перед י со шва',pfxTagGuttural:'перед א/ע',pfxTagU:'ו → וּ',pfxTagCombo:'несколько приставок',pfxTagPron:'ש + местоимение',
    endColorsLabel:'Цвет окончаний',endColorsOn:'вкл',endColorsOff:'выкл',
    nikudCheckLabel:'Огласовки в ответе',nikudCheckAuto:'авто',nikudCheckOff:'выкл',nikudCheckSmart:'различать',nikudCheckFull:'полностью',
    nikudCheckAutoNote:'При «авто» проверка включается, когда огласовки показываются «всегда».',
    nikudNoticeTitle:'Эта запись читается по-разному',nikudNeed:'Нужна огласовка.',nikudWrong:'Согласные верны, огласовка другая.',nikudWrongConsonants:'Согласные не совпали.',youTyped:'ты ввёл:',addNikud:'добавь огласовку',ambiguousReadings:'прочтения:',
    nikudPatah:'патах',nikudQamats:'камац',nikudTsere:'цере',nikudSegol:'сеголь',nikudHiriq:'хирик',nikudHolam:'холам',nikudQubuts:'кубуц',nikudShva:'шва',nikudHatafPatah:'хатаф-патах',nikudHatafSegol:'хатаф-сеголь',nikudHatafQamats:'хатаф-камац',nikudDagesh:'дагеш',
    pfxCorrectAnswer:'Правильный разбор:',pfxFullForm:'Форма целиком:',pfxDecomp:'Разбор:'
  },
  en:{
    appTitle:'Hebrew · Pronouns',tabMap:'Map',tabPath:'Path',tabTrain:'Practice',tabPhrases:'Phrases',
    mapSubRoles:'Roles',mapSubKey:'Key',mapSubPreps:'Prepositions',mapSubHeat:'Heat map',mapSubTraps:'Traps',
    rolesTitle:'10 roles',rolesIntro:'A pronoun is a perspective, not a word. Each role always has the same color. Gender and number are shown by shape and label.',
    keyTitle:'Ending key',keyIntro:'Ten endings are shared by almost all prepositions. Only the stem changes.',
    keyRuleTitle:'Rule',keyRuleText:'-הם after a vowel stem (ל, ב, של, על, אל, מ), -ם after a consonant (את, עם, אצל, בשביל). Likewise -הן / -ן.',
    familiesTitle:'Preposition families',familySimple:'simple: ל, ב, של',familyYod:'with -י-: על, אל',familyConsonant:'consonant: את, עם, אצל, בשביל',familyIrregular:'irregular: מ',
    examplesTitle:'Examples with three prepositions',prepsTitle:'Prepositions with endings',prepsIntro:'The stem is neutral, the ending takes the role color. Tap 🔊 to hear the form.',
    heatTitle:'Heat map',heatIntro:'Rows are roles, columns are prepositions. Tap a cell to see the form and statistics.',
    heatNoData:'no data',trapsTitle:'Russian traps',trapsIntro:'Where Russian case or preposition differs from Hebrew.',
    pathTitle:'Path',pathIntro:'Levels go from roles to prepositions, frames and speed. Everything is open by default; “Strict path” locks the next level until 70% of the previous one.',
    levelLocked:'Unlocks after 70% of the previous level',levelStart:'Start',
    filterPreps:'Prepositions',filterFrames:'Frames',filterRoles:'Roles',filterWeak:'Weak only',filterNotAuto:'Not automatic yet',filterReset:'Reset filters',
    framesExist:'have/no/states',framesVerbs:'verbs',
    person1:'1st person',person2:'2nd person',person3:'3rd person',numS:'sing.',numP:'plur.',genM:'m.',genF:'f.',
    modeBuild:'Build',modeRole2Form:'Role → form',modeForm2Role:'Form → role',modePerspective:'Perspective',modeRun:'Run',modeSpeed:'Speed',modeKeyMini:'Key mini',modeListen:'Listening',
    check:'Check',hint:'Hint',show:'Show',next:'Next',start:'Start',again:'Again',
    correct:'Correct!',wrong:'Wrong',answerWas:'Correct answer:',bothCorrect:'both are correct:',colloqAlso:'colloq.: also',
    score:'Score',streak:'Streak',best:'Best',chooseStem:'Stem',chooseEnd:'Ending',wholeForm:'Choose the whole form',
    runChooseFrame:'Choose a frame',runStart:'Start run',runTime:'Time',runErrors:'Errors',runBest:'Best time',runNewRecord:'New record!',runDone:'Run complete',
    speedStart:'Start 60 seconds',speedTime:'Left',speedCorrect:'Correct',speedBest:'Record',speedNewRecord:'New record!',speedDone:'Time is up',
    listenUnavailable:'Speech is not available in this browser',listenReplay:'Replay',listenChooseRole:'Which role is it?',
    phrasesTitle:'Phrases',phraseModeChoice:'Choice',phraseModeType:'Type',phraseHint:'Hint',phraseTrap:'Russian trap',phraseNext:'Next',phraseRead:'Read aloud',
    settingsTitle:'Settings',nikudLabel:'Niqqud',nikudAlways:'Always',nikudHint:'On hint',nikudOff:'Off',translitLabel:'Transliteration',registerLabel:'Register',registerColloq:'Colloquial',registerStrict:'Strict standard',soundLabel:'Sound',strictPathLabel:'Strict path',exportLabel:'Export progress',importLabel:'Import progress',resetLabel:'Reset progress',resetConfirm:'Reset all progress? Settings, theme and language will stay.',close:'Close',saved:'Saved',importError:'Could not read the file',imported:'Progress imported',
    themeDark:'Dark theme',themeLight:'Light theme',keyboardTitle:'Keyboard',keyboardHide:'Hide keyboard',ttsNoVoice:'No Hebrew voice found — audio hidden',irregularForm:'irregular form',resetDone:'Progress reset',exportError:'Could not save the file',
    noData:'—',attempts:'attempts',accuracy:'accuracy',avgTime:'average time',fastStreak:'fast streak',mastered:'mastered',auto:'automatic',of:'of',
    hintRu:'Russian translation',trapCard:'Russian trap',settingsSaved:'Settings saved',exported:'File saved',frameBlank:'___',
    speakerSays:'says',targetIs:'Who is meant:',perspectiveIntro:'The role depends on who is looking.',weakEmpty:'No items match this filter',noVoiceHidden:'Audio hidden: no Hebrew voice',
    importPrompt:'Choose a progress JSON file',endingLabel:'Ending',roleLabel:'Role',prepLabel:'Preposition',formLabel:'Form',statsLabel:'Statistics',
    roleQuestion:'Which role?',pronQuestion:'Which pronoun?',endingQuestion:'Which ending?',listenQuestion:'Listen and choose the role',buildQuestion:'Build the form',chooseForm:'Choose the form',
    tabPrefix:'Prefixes',
    pfxSubRef:'Reference',pfxSubTrain:'Trainer',pfxSubMap:'Map',
    pfxMnemonicTitle:'משה וכלב — Moshe and Kalev',pfxMnemonicIntro:'Seven prefix letters in mnemonic order. Tap a tile for forms and examples.',
    pfxRulesTitle:'Rules',pfxTrapsTitle:'Traps',
    pfxTrainTitle:'Prefix trainer',pfxFilters:'Filters',
    pfxFilterPrefixes:'Prefixes',pfxFilterTags:'Condition',pfxFilterForms:'Form',pfxFilterWeak:'Weak only',pfxFilterNotAuto:'Not automatic yet',pfxFilterReset:'Reset filters',
    pfxModeLetter:'Letter → meaning',pfxModeBuild:'Build the word',pfxModeForm:'Which form?',pfxModeParse:'Parse',pfxModeSpeed:'Speed',pfxModePhrases:'Phrases',
    pfxLetterQuestion:'What does this prefix mean?',pfxMeaningQuestion:'Which prefix is it?',pfxBuildQuestion:'Build the word',pfxFormQuestion:'Which prefix form?',pfxParseQuestion:'Choose the parsing',
    pfxArticle:'with the article',pfxNoArticle:'without the article',pfxPrefixLabel:'Prefix',pfxWordLabel:'Word',pfxRuleLabel:'Rule',pfxExamples:'Examples',
    pfxBuildNote:'Without niqqud “with the article” and “without the article” look the same for ב/ל/כ — add niqqud.',pfxEmpty:'No items match this filter',
    pfxSpeedStart:'Start 60 seconds',pfxSpeedDone:'Time is up',pfxSpeedCorrect:'Correct',pfxSpeedBest:'Record',pfxSpeedNewRecord:'New record!',
    pfxPhrasesTitle:'Prefix phrases',pfxPhraseChoice:'Choice',pfxPhraseType:'Type',pfxPhraseHint:'Hint',pfxPhraseNext:'Next',
    pfxHeatTitle:'Prefix map',pfxHeatIntro:'Rows are prefixes, columns are conditions. Tap a cell for examples and statistics.',pfxProgress:'Prefix progress',pfxMastered:'mastered',
    pfxTagPlain:'default form',pfxTagArticle:'with the article ה',pfxTagSheva:'before shva',pfxTagYod:'before י with shva',pfxTagGuttural:'before א/ע',pfxTagU:'ו → וּ',pfxTagCombo:'several prefixes',pfxTagPron:'ש + pronoun',
    endColorsLabel:'Ending colors',endColorsOn:'on',endColorsOff:'off',
    nikudCheckLabel:'Niqqud in answers',nikudCheckAuto:'auto',nikudCheckOff:'off',nikudCheckSmart:'distinguish',nikudCheckFull:'full',
    nikudCheckAutoNote:'In “auto”, checking turns on when niqqud is shown “always”.',
    nikudNoticeTitle:'This spelling has several readings',nikudNeed:'Niqqud required.',nikudWrong:'Consonants are correct, but the niqqud is different.',nikudWrongConsonants:'Consonants do not match.',youTyped:'you typed:',addNikud:'add niqqud',ambiguousReadings:'readings:',
    nikudPatah:'patah',nikudQamats:'qamats',nikudTsere:'tsere',nikudSegol:'segol',nikudHiriq:'hiriq',nikudHolam:'holam',nikudQubuts:'qubuts',nikudShva:'shva',nikudHatafPatah:'hataf patah',nikudHatafSegol:'hataf segol',nikudHatafQamats:'hataf qamats',nikudDagesh:'dagesh',
    pfxCorrectAnswer:'Correct parsing:',pfxFullForm:'Full form:',pfxDecomp:'Parsing:'
  }
};

