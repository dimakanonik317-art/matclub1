/* ЕГЭ-2027: номера заданий из тематического каталога «Веб ЕГЭ».
   В каждом ряду — идентификаторы открытого банка, без материалов демоверсии (M27).
   https://webege.io/bank/ege-matematika-profil */
(() => {
  const pools = [
    '0005E9 018816 01BE6F 1DD37A 21628C 282EDC 2933FB 2ACFD0 30B4E7 3B5E5D 3CF402 3D4E60 485B9F 4E31DD 59978F 5B3F1A 5B6E6D',
    '028837 0432E9 0A394E 166200 1C7454 1FEA81 238861 34F395 3F02C4 3FF85B 40B442 44700A 4A073E 579B74 58E4C5 602093 713E60',
    '06E32C 0762B2 0989E5 135723 1D9551 1E28D8 1F4550 2359E0 26B211 29FE0E 2D6929 2F9BDB 32AF22 33B18F 370392 37164B 41E054',
    '0540C3 05E30D 088ADE 0C303D 0F9157 16D19B 1B431B 27C71D 2A4DE5 2EB7E3 2F945C 379055 3D1090 47447E 530858 5540EE 56097B',
    '07D66F 0CC4F3 0ECDD4 11CCDE 151689 198C47 226FB1 2965EA 2AFDA9 30D3F2 315ACA 346547 3C509C 436A74 51EADD 546A68 553B3F',
    '06AF1F 06D921 0B15AC 12B3C9 17CF80 19E729 19FBCF 1E16A7 1E76F6 1FE24C 2BDA84 2D920F 2FB6C7 3599D1 370EDC 37EA9D 3A5432',
    '042F86 0444D9 0DC0A0 0E5270 10C0E6 110B03 11A20A 133372 223EC5 224219 23C8BB 24F9AF 2D494A 2D68F1 330712 334A92 3F52B8',
    '026E2D 093E32 099555 0B2322 0ED279 162BAA 28FA05 321FCD 396DA0 4849A6 497F54 49C3EA 4DB285 51B8B6 56EA1A 57A7B1 57C40E',
    '00002A 01C5CD 0B62CD 0C4928 1803B0 191995 19DD0F 222C71 2D0967 2E169A 2E36C3 338D5A 344B7E 369392 3B0CD7 3B8999 3D81A7',
    '02F1DB 06B9F5 071261 081941 0B236A 17A0D7 1E4FB8 205CF2 24E361 274BE8 296B11 29D730 2A6A94 33B385 33D8E1 366C0F 39F54E',
    '02A17E 06DEEE 08C3D9 09EF38 0B896F 12736C 196238 1DC3CC 30F054 31336D 38A32C 3D9010 448E90 492E2A 4E7EC1 5BF069 5F9519',
    '01A05E 033968 198EC9 1BFB4B 1DD2E7 1E41B2 1ECEE8 20970C 221C18 24A166 24E5F8 277247 27ACB1 285552 2D0BED 2E9992 336660',
    '0000C3 015B20 0448F1 0AD550 0BD320 0C47ED 1CAE46 1D3525 209E7E 2247B7 24AAD1 2CCC19 2D54B0 30EEA9 34BB16 34CAC3 350814 3BB500',
    '03B44B 04294C 0549EB 065E0A 0B28A5 0E8DDE 135C80 13D60B 142CDC 149319 16C715 17B23F 182CF4 1D76E2 1F7CE6 30ED04 325286 33A81C',
    '000E35 005232 024079 09B4F9 15664C 160E7E 1AE932 1EF816 1FCDE0 259766 2A2B2F 2BBA5D 33964E 3416BF 3991B7 41D348 4762EB 481BB0',
    '0BA332 1187D1 1F03D1 22FEBB 257120 262AEA 29A6B4 29E10A 2A731E 31E106 36614C 3EFF42 4221BE 423D7F 45786C 4C1D36 4DD4D9 53A300',
    '003F6E 0063ED 00E23C 0112D3 060A0A 0BC5F1 0E3CE7 0E9DD3 10D010 15EF35 16DDDD 2412FA 2AE241 2B52E7 2EBDBF 34E1B6 36CE6E 3B468E',
    '0106DC 04FEB6 073F98 07CC1C 093D22 11D603 162563 1CCE7C 211B61 36F316 37FD10 3D498A 3D7367 3DD135 3E3293 421A63 44907E 456B95',
    '002FC3 0FB969 12AE34 2907EB 2A4168 2B4308 2DC181 30D64C 34A218 354582 37B190 394D51 40BED3 4A9559 4B81D5 5066E8 6948DB 6E32AD'
  ].map(row => row.split(' '));
  const names = [
    'Планиметрия', 'Векторы', 'Стереометрия', 'Вероятность', 'Сложные события',
    'Уравнение', 'Вычисления и преобразования', 'Производная и первообразная',
    'Прикладная задача', 'Текстовая задача', 'Графики функций', 'Наибольшее и наименьшее значение',
    'Уравнение с отбором корней', 'Стереометрия с обоснованием', 'Неравенство',
    'Экономическая задача', 'Планиметрия с обоснованием', 'Параметр', 'Числа и их свойства'
  ];
  const bank = 'https://ege.fipi.ru/bank/index.php?proj=AC437B34557F88EA4115D2F374B0A07B&qid=';
  const mirror = 'https://webege.io/bank/ege-matematika-profil/zadanie/';
  const button = document.getElementById('openEgeVariant');
  const dialog = document.getElementById('egeVariantDialog');
  const clock = document.getElementById('egeVariantClock');
  const short = document.getElementById('egeVariantShort');
  const long = document.getElementById('egeVariantLong');
  const storageKey = 'matclub-ege-variant-2027-previous';
  let previous = [];
  let deadline = 0;
  let timer;
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey));
    if (Array.isArray(saved)) previous = saved;
  } catch {}

  function showTime() {
    const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    const segments = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60];
    clock.textContent = segments.map(value => String(value).padStart(2, '0')).join(':');
    if (!seconds) clearInterval(timer);
  }

  function buildRow(id, index) {
    const row = document.createElement('li');
    const heading = document.createElement('strong');
    heading.textContent = names[index];
    const official = document.createElement('a');
    official.textContent = 'ФИПИ · ' + id;
    official.href = bank + id;
    official.target = '_blank';
    official.rel = 'noopener noreferrer';
    const readable = document.createElement('a');
    readable.textContent = 'Условие и разбор ↗';
    readable.href = mirror + id;
    readable.target = '_blank';
    readable.rel = 'noopener noreferrer';
    row.append(heading, official, readable);
    return row;
  }

  button.addEventListener('click', () => {
    const draws = crypto.getRandomValues(new Uint32Array(pools.length));
    const next = pools.map((pool, index) => {
      const candidates = pool.filter(id => id !== previous[index]);
      return candidates[draws[index] % candidates.length];
    });
    const rows = next.map(buildRow);
    short.replaceChildren(...rows.slice(0, 12));
    long.replaceChildren(...rows.slice(12));
    previous = next;
    try { sessionStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
    deadline = Date.now() + 235 * 60_000;
    dialog.showModal();
    dialog.scrollTop = 0;
    clearInterval(timer);
    showTime();
    timer = setInterval(showTime, 1000);
  });
  dialog.addEventListener('close', () => clearInterval(timer));
})();

