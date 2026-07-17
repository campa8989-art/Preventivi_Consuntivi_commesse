/**
 * Logica Applicativa Principale (app.js)
 * Gestisce lo stato dell'applicazione, la persistenza in LocalStorage,
 * il routing lato client, i calcoli in tempo reale e il caricamento dei modelli di esempio.
 */

window.addEventListener('error', function(e) {
    alert("ERRORE JS GLOBALE: " + e.message + " in " + e.filename + ":" + e.lineno);
});

// --- DATI DI ESEMPIO (Precaricati dal Modello Originale) ---
const SAMPLE_PREVENTIVI = [
    {
        id: 'prev-sample-35',
        number: '35',
        date: '2026-06-24',
        committente: 'RAI',
        presidio: 'RAI MILANO',
        areaLavoro: 'Palazzo 27 - Piano -2',
        areaIntervento: 'C.so Sempione 27 (MI)',
        odl: 'ODL-2026-0035',
        prevCode: 'REK/BD/BD/2026/U/ic/MP/000163',
        oggetto: 'RAI Milano - Preventivo per Sostituzione componenti elettrici guasti Pompa 25',
        companyName: 'DIREZIONE OPERATION - AREA LOMBARDIA',
        caPerson: 'Ripa Antonio',
        caPerson2: 'Tassini Davide',
        markupPercent: 15,
        discountPercent: 31,
        status: 'approved', // draft, sent, approved, rejected
        notes: 'Sostituzione di n.1 interruttore sezionatore e contattori di avviamento guasti per la pompa n.25 sita al piano -2.',
        conditions: {
            pagamenti: 'Termini contrattuali',
            esclusione: 'Tutto quanto non descritto',
            validita: '30 giorni',
            consegna: '30 giorni data ordine'
        },
        items: [
            { id: 'item-1', listino: '', voci: 'N.P.', descrizione: 'SCHNEIDER ELECTRIC - SNRA9S65391 INT. SEZIONAT. ISW 3P 100A - A9S65391', um: 'cad', qty: 1, price: 93.89, type: 'materiali' },
            { id: 'item-2', listino: '', voci: 'N.P.', descrizione: 'ABB SPA - ABBAF80300011 AF80-30-00-11 CONT 3P 80A 24-60V AC/DC - AF80300011', um: 'cad', qty: 1, price: 261.43, type: 'materiali' },
            { id: 'item-3', listino: '', voci: 'N.P.', descrizione: 'ABB SPA - ABBTF9668 TF96-68 RELE TERMICO 57-68 CL:10 - TF9668', um: 'cad', qty: 1, price: 124.36, type: 'materiali' },
            { id: 'item-4', listino: '', voci: 'N.P.', descrizione: 'ABB SPA - ABBCAL411 CAL4-11 CONTATTO AUSILIARIO LATERALE NA+ - CAL411', um: 'cad', qty: 1, price: 8.34, type: 'materiali' },
            { id: 'item-5', listino: '', voci: 'N.P.', descrizione: 'ABB SPA - ABBCA401 CA4-01 CONTATTO AUSILIARIO NC FRONTALE - CA401', um: 'cad', qty: 2, price: 5.37, type: 'materiali' },
            { id: 'item-6', listino: '', voci: 'N.P.', descrizione: 'ABB SPA - ABBCA410 CA4-10 CONTATTO AUSILIARIO NA FRONTALE - CA410', um: 'cad', qty: 2, price: 5.37, type: 'materiali' },
            { id: 'item-7', listino: 'Manodopera', voci: 'M.O.', descrizione: 'Operaio Specializzato - Intervento idraulico ed elettrico per montaggio e collaudo componenti pompa', um: 'ore', qty: 6, price: 38.00, type: 'manodopera' }
        ]
    }
];

const SAMPLE_CONSUNTIVI = [
    {
        id: 'cons-sample-2026',
        name: 'CONSUNTIVO EXTRA CANONE 2026',
        committente: 'RAI',
        presidio: 'RAI MILANO',
        areaIntervento: 'C.so Sempione 27 (MI)',
        odl: 'ODL-2026-CONS',
        date: '2026-06-01',
        companyName: 'DIREZIONE OPERATION - AREA LOMBARDIA',
        caPerson: 'RIPA ANTONIO',
        caPerson2: 'TASSINI DAVIDE',
        markupPercent: 15,
        discountPercent: 31,
        oggetto: 'OGGETTO: RIEPILOGO CONSUNTIVI LAVORAZIONI EXTRA CANONE APRILE-MAGGIO-GIUGNO 2026',
        extraCanoneText: 'MANUTENZIONE  EXTRA CANONE',
        status: 'approved',
        months: [
            {
                id: 'month-aprile',
                monthName: 'APRILE NP 2026',
                workReports: [
                    {
                        id: 'rep-aprile-1',
                        reportId: '0155952/22',
                        dateText: '',
                        items: [
                            { id: 'ap-it-1', listino: 'nuovo prezzo', voci: 'sacchi extra 24_4_26 ALIM_DALI', descrizione: 'HFL75W-900-1800 DALI -ALIM DA', um: 'cad', qty: 5, price: 44.50 }
                        ]
                    },
                    {
                        id: 'rep-aprile-2',
                        reportId: 'Vuoto',
                        dateText: '',
                        items: []
                    }
                ]
            },
            {
                id: 'month-maggio',
                monthName: 'MAGGIO NP 2026 ',
                workReports: [
                    {
                        id: 'rep-maggio-1',
                        reportId: '0155963/22',
                        dateText: 'DEL 19/05/26',
                        items: [
                            { id: 'ma-it-1', listino: 'nuovo prezzo', voci: 'sacchi extracan 18-05-26-19052026091102', descrizione: 'CSP-N 75X17 G CAN. PAVIMENTO', um: 'cad', qty: 8, price: 13.49 },
                            { id: 'ma-it-2', listino: 'nuovo prezzo', voci: 'BTICINO - BTIS2020DE SPINA 2P+T ST. FRANCO_TED ORIENT SSPAZ B - S2020DE', descrizione: 'BTICINO - BTIS2020DE SPINA 2P+T ST. FRANCO/TED ORIENT SSPAZ B - S2020DE', um: 'cad', qty: 8, price: 2.54 },
                            { id: 'ma-it-3', listino: 'nuovo prezzo', voci: 'DDT 8046428845 - R026011615', descrizione: 'SPINA RJ45 8P8C CAT6 SCH.FLEX', um: 'cad', qty: 16, price: 0.41 },
                            { id: 'ma-it-4', listino: 'nuovo prezzo', voci: 'DDT 8046489037 - R026011617', descrizione: 'CAT6 - CABLE U/UTP LSOH 23 AWG B', um: 'M', qty: 30, price: 0.67 },
                            { id: 'ma-it-5', listino: 'nuovo prezzo', voci: 'SACCHI 04-02-26 extrac. ray way-05022026080203', descrizione: 'CAVO 3G2,5 BTFS180R18 450/750V 3G2,5MMQ', um: 'M', qty: 15, price: 1.44 }
                        ]
                    }
                ]
            },
            {
                id: 'month-giugno',
                monthName: 'GIUGNO NP 2026 ',
                workReports: [
                    {
                        id: 'rep-giugno-1',
                        reportId: '0155973/22',
                        dateText: 'DEL 15/06/2026',
                        items: [
                            { id: 'gi-it-1', listino: 'nuovo prezzo', voci: 'sonepar extr 12-06-26-alim.led corridoi', descrizione: 'ALIM. LED TENS. COSTANTE 200W 24VDC DALI', um: 'cad', qty: 4, price: 74.65 }
                        ]
                    }
                ]
            }
        ]
    }
];

const SAMPLE_ORE_EXTRA = [
    {
        id: 'ore-sample-2026',
        name: 'ORE EXTRA 3Q2026',
        committente: 'RAI',
        presidio: 'RAI MILANO SEMPIONE',
        areaIntervento: 'C.so Sempione 27 (MI)',
        odl: 'ODL-ORE-EXTRA-3Q26',
        prevCode: 'FACI16442C-MAMIUMC-019',
        date: '2026-07-01',
        companyName: 'DIREZIONE OPERATION - AREA LOMBARDIA',
        caPerson: 'Ripa Antonio',
        caPerson2: 'Tassini Davide',
        costoBase: 18.30,
        markupPercent: 26.50,
        discountPercent: 31.00,
        formulaType: 'originale',
        status: 'draft',
        months: [
            {
                id: 'ore-month-luglio',
                monthName: 'LUG 2026 consuntivo',
                part1: [
                    { key: 'feriale_diurno', description: 'ORE FERIALI DIURNE AD INTEGRAZIONE (06:00-08:30)', oreGg: 2.5, giorni: 0, maggiorazione: 0 },
                    { key: 'feriale_notturno', description: 'Sovrapprezzo per lavoro notturno - ORE NOTTURNE FERIALI(00:30-06:00)', oreGg: 5.5, giorni: 0, maggiorazione: 0.3 },
                    { key: 'festivo', description: 'Sovrapprezzo per lavoro festivo - ORE FESTIVE', oreGg: 8.0, giorni: 0, maggiorazione: 0.5 }
                ],
                part2: []
            },
            {
                id: 'ore-month-agosto',
                monthName: 'AGO 2026 consuntivo',
                part1: [
                    { key: 'feriale_diurno', description: 'ORE FERIALI DIURNE AD INTEGRAZIONE (06:00-08:30)', oreGg: 2.5, giorni: 0, maggiorazione: 0 },
                    { key: 'feriale_notturno', description: 'Sovrapprezzo per lavoro notturno - ORE NOTTURNE FERIALI(00:30-06:00)', oreGg: 5.5, giorni: 0, maggiorazione: 0.3 },
                    { key: 'festivo', description: 'Sovrapprezzo per lavoro festivo - ORE FESTIVE', oreGg: 8.0, giorni: 0, maggiorazione: 0.5 }
                ],
                part2: []
            },
            {
                id: 'ore-month-settembre',
                monthName: 'SET 2026 consuntivo',
                part1: [
                    { key: 'feriale_diurno', description: 'ORE FERIALI DIURNE AD INTEGRAZIONE (06:00-08:30)', oreGg: 2.5, giorni: 0, maggiorazione: 0 },
                    { key: 'feriale_notturno', description: 'Sovrapprezzo per lavoro notturno - ORE NOTTURNE FERIALI(00:30-06:00)', oreGg: 5.5, giorni: 0, maggiorazione: 0.3 },
                    { key: 'festivo', description: 'Sovrapprezzo per lavoro festivo - ORE FESTIVE', oreGg: 8.0, giorni: 0, maggiorazione: 0.5 }
                ],
                part2: []
            }
        ]
    }
];

function generatePart2Days(year, monthIndex) {
    const days = [];
    const date = new Date(year, monthIndex, 1);
    while (date.getMonth() === monthIndex) {
        const dayStr = date.getDate();
        const formattedDate = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(dayStr).padStart(2, '0')}`;
        days.push({
            date: formattedDate,
            hours: 0,
            type: 'diurno'
        });
        date.setDate(date.getDate() + 1);
    }
    return days;
}

// --- STATO APPLICATIVO ---
let state = {
    commesse: [], // Array di commesse: { id, nome, committenteDefault }
    activeCommessaId: 'all', // 'all' per tutte, o ID specifico
    preventivi: [],
    consuntivi: [],
    oreExtra: [],
    settings: {
        companyName: 'DIREZIONE OPERATION - AREA LOMBARDIA',
        companyLogo: 'rekeep',
        caPerson: 'Ripa Antonio',
        caPerson2: 'Tassini Davide',
        defaultMarkup: 15,
        defaultDiscount: 31,
        defaultFormulaType: 'corretta',
        theme: 'dark'
    },
    activeView: 'dashboard',
    editingId: null,
    activeSheetTab: 'riepilogo' // 'riepilogo' o ID del mese
};

// --- CARICAMENTO E SALVATAGGIO STATO ---
function loadState() {
    const savedState = localStorage.getItem('gestione_preventivi_stato');
    if (savedState) {
        try {
            state = JSON.parse(savedState);
            if (!state.preventivi) {
                state.preventivi = [];
            }
            if (!state.consuntivi) {
                state.consuntivi = [];
            }
            if (!state.oreExtra) {
                state.oreExtra = [];
            }
            if (!state.rapporti) {
                state.rapporti = [];
            }
            if (!state.commesse) {
                state.commesse = [];
            }
            if (!state.activeCommessaId) {
                state.activeCommessaId = 'all';
            }
            if (!state.activeView) {
                state.activeView = 'dashboard';
            }
            if (!state.settings) {
                state.settings = {
                    companyName: 'DIREZIONE OPERATION - AREA LOMBARDIA',
                    companyLogo: 'rekeep',
                    caPerson: 'Ripa Antonio',
                    caPerson2: 'Tassini Davide',
                    defaultMarkup: 15,
                    defaultDiscount: 31,
                    defaultFormulaType: 'corretta',
                    theme: 'dark'
                };
            }
            if (!state.settings.theme) {
                state.settings.theme = 'dark';
            }
            if (!state.activeSheetTab) {
                state.activeSheetTab = 'riepilogo';
            }

            // Migrazione automatica se mancano le commesse o sono vuote
            if (state.commesse.length === 0) {
                const committenti = new Set();
                (state.preventivi || []).forEach(p => p.committente && committenti.add(p.committente));
                (state.consuntivi || []).forEach(c => c.committente && committenti.add(c.committente));
                (state.oreExtra || []).forEach(oe => oe.committente && committenti.add(oe.committente));

                if (committenti.size === 0) {
                    state.commesse.push({ id: 'comm-default', nome: 'Commessa Standard', committenteDefault: 'RAI' });
                } else {
                    committenti.forEach(c => {
                        const id = 'comm-' + c.toLowerCase().replace(/[^a-z0-9]/g, '-');
                        state.commesse.push({
                            id: id,
                            nome: 'Commessa ' + c,
                            committenteDefault: c
                        });
                    });
                }

                // Assegna commessaId a tutti gli elementi esistenti
                (state.preventivi || []).forEach(p => {
                    if (!p.commessaId && p.committente) {
                        p.commessaId = 'comm-' + p.committente.toLowerCase().replace(/[^a-z0-9]/g, '-');
                    }
                });
                (state.consuntivi || []).forEach(c => {
                    if (!c.commessaId && c.committente) {
                        c.commessaId = 'comm-' + c.committente.toLowerCase().replace(/[^a-z0-9]/g, '-');
                    }
                });
                (state.oreExtra || []).forEach(oe => {
                    if (!oe.commessaId && oe.committente) {
                        oe.commessaId = 'comm-' + oe.committente.toLowerCase().replace(/[^a-z0-9]/g, '-');
                    }
                });
                (state.rapporti || []).forEach(r => {
                    if (!r.commessaId && r.cliente) {
                        r.commessaId = 'comm-' + r.cliente.toLowerCase().replace(/[^a-z0-9]/g, '-');
                    }
                });
                
                // Salva lo stato con i dati migrati
                setTimeout(() => saveState(), 0);
            }
        } catch (e) {
            console.error("Errore nel parse dello stato salvato, reimposto...", e);
            initDefaultState();
        }
    } else {
        initDefaultState();
    }
    
    // Applica tema
    document.documentElement.setAttribute('data-theme', state.settings.theme || 'dark');
}

function updateLastUpdatedDisplay() {
    const el = document.getElementById('backup-last-updated-val');
    if (el) {
        if (state.lastUpdated) {
            try {
                const date = new Date(state.lastUpdated);
                el.textContent = date.toLocaleString('it-IT');
            } catch (e) {
                el.textContent = state.lastUpdated;
            }
        } else {
            el.textContent = 'Mai';
        }
    }
}

function saveState() {
    state.lastUpdated = new Date().toISOString();
    localStorage.setItem('gestione_preventivi_stato', JSON.stringify(state));
    updateDashboardStats();
    updateLastUpdatedDisplay();
    if (state.activeView === 'dashboard') {
        renderDashboard();
    }
}

function initDefaultState() {
    state.commesse = [
        { id: 'comm-rai', nome: 'Commessa RAI Milano', committenteDefault: 'RAI' },
        { id: 'comm-inps', nome: 'Commessa INPS', committenteDefault: 'INPS' }
    ];
    state.activeCommessaId = 'all';

    state.preventivi = SAMPLE_PREVENTIVI.map(p => ({
        ...p,
        commessaId: p.committente === 'RAI' ? 'comm-rai' : 'comm-inps'
    }));
    state.consuntivi = SAMPLE_CONSUNTIVI.map(c => ({
        ...c,
        commessaId: c.committente === 'RAI' ? 'comm-rai' : 'comm-inps'
    }));
    state.oreExtra = JSON.parse(JSON.stringify(SAMPLE_ORE_EXTRA)).map(oe => ({
        ...oe,
        commessaId: oe.committente === 'RAI' ? 'comm-rai' : 'comm-inps'
    }));
    state.rapporti = [
        {
            id: 'rapp-sample-074931',
            number: '074931',
            richiestaNum: '',
            dittaEsecutrice: 'Rekeep SpA',
            cliente: 'RAI',
            via: 'SEMPIONE',
            civico: '27',
            citta: 'MILANO',
            edificio: '',
            piano: '',
            vano: '',
            tipologiaIntervento: ['NORMALE'],
            causaIntervento: ['MANUTENZIONE PER USURA'],
            causaInterventoAltro: '',
            lavoriEseguiti: ['COMPLETATI'],
            lavoriEseguitiAltro: '',
            descrizioneIntervento: 'ZONA ST. 1311 SOSTITUZIONE PRESE AMMALORATE\nZONA ST 5312 RIMOZIONE CAVI FM-DATI E CANALINE A PARETE',
            operatori: [
                { id: 'op-1', cognomeNome: 'CICHELLO O.', dalleOre: '', alleOre: '', oreOrd: '', oreStr: '', oreFest: '', oreViaggio: '', speseVarie: '' }
            ],
            materiali: [
                { id: 'mat-1', descrizione: 'CESTELLO PORTA FRUTTI MATIX 3P', um: 'N', qty: 1 },
                { id: 'mat-2', descrizione: 'PLACCA MATIX 3P', um: 'N', qty: 1 },
                { id: 'mat-3', descrizione: 'BIPASSO MATIX', um: 'N', qty: 1 },
                { id: 'mat-4', descrizione: 'SHUKO MATIX', um: 'N', qty: 1 }
            ],
            anomalieDescrizione: '',
            anomalieAzioni: '',
            dataLavori: '2026-06-29',
            firmaEsecutore: '',
            referenteCliente: '',
            responsabile: '',
            status: 'approved',
            commessaId: 'comm-rai'
        }
    ];

    // Svuota giorni part2 ore extra di default
    state.oreExtra.forEach(oe => {
        if (oe.months && oe.months[0]) oe.months[0].part2 = [];
        if (oe.months && oe.months[1]) oe.months[1].part2 = [];
        if (oe.months && oe.months[2]) oe.months[2].part2 = [];
    });

    state.settings = {
        companyName: 'DIREZIONE OPERATION - AREA LOMBARDIA',
        companyLogo: 'rekeep',
        caPerson: 'Ripa Antonio',
        caPerson2: 'Tassini Davide',
        defaultMarkup: 15,
        defaultDiscount: 31,
        defaultFormulaType: 'corretta',
        theme: 'dark'
    };
    saveState();
}

// --- UTILITY DI FORMATTAZIONE ---
function formatCurrency(value) {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
}

function formatNumber(value, decimals = 2) {
    return new Intl.NumberFormat('it-IT', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
}

function calculateMarginPercent(markupPercent, discountPercent, formulaType = 'corretta') {
    const m = (Number(markupPercent) || 0) / 100;
    const d = (Number(discountPercent) || 0) / 100;
    let margin = 0;
    if (formulaType === 'originale') {
        margin = m * (1 - d);
    } else {
        margin = (1 + m) * (1 - d) - 1;
    }
    return margin * 100;
}

function updatePreventivoMarginDisplay() {
    if (!activePrevObj) return;
    const markup = activePrevObj.markupPercent || 0;
    const discount = activePrevObj.discountPercent || 0;
    const fType = activePrevObj.formulaType || 'corretta';
    const margin = calculateMarginPercent(markup, discount, fType);
    const el = document.getElementById('prev-margin-percentage');
    if (el) {
        el.textContent = `${margin >= 0 ? '+' : ''}${formatNumber(margin, 2)}%`;
        if (margin < 0) {
            el.style.color = '#ef4444';
        } else {
            el.style.color = '#10b981';
        }
    }
}

function updateConsuntivoMarginDisplay() {
    if (!activeConsObj) return;
    const markup = activeConsObj.markupPercent || 0;
    const discount = activeConsObj.discountPercent || 0;
    const fType = activeConsObj.formulaType || 'corretta';
    const margin = calculateMarginPercent(markup, discount, fType);
    const el = document.getElementById('cons-margin-percentage');
    if (el) {
        el.textContent = `${margin >= 0 ? '+' : ''}${formatNumber(margin, 2)}%`;
        if (margin < 0) {
            el.style.color = '#ef4444';
        } else {
            el.style.color = '#10b981';
        }
    }
}

// --- LOGICA DI CALCOLO RIGHE ---
function calculateItemRow(qty, price, markupPercent, discountPercent, maggiorata = true, formulaType = null) {
    const q = Number(qty) || 0;
    const p = Number(price) || 0;
    const m = (Number(markupPercent) || 0) / 100;
    const d = (Number(discountPercent) || 0) / 100;
    
    let fType = formulaType;
    if (!fType) {
        if (typeof state !== 'undefined') {
            if (state.activeView === 'preventivi-edit' && typeof activePrevObj !== 'undefined' && activePrevObj) {
                fType = activePrevObj.formulaType;
            } else if (state.activeView === 'consuntivi-edit' && typeof activeConsObj !== 'undefined' && activeConsObj) {
                fType = activeConsObj.formulaType;
            }
            if (!fType) {
                fType = state.settings?.defaultFormulaType || 'corretta';
            }
        } else {
            fType = 'corretta';
        }
    }
    
    let increment = 0;
    let discount = 0;
    
    if (fType === 'originale') {
        if (maggiorata) {
            increment = p * m;
            discount = - (increment * (1 - d));
        } else {
            increment = 0;
            discount = - (p * d);
        }
    } else {
        if (maggiorata) {
            increment = p * m;
            discount = - (p + increment) * d;
        } else {
            increment = 0;
            discount = - (p * d);
        }
    }
    
    const puScontato = p + increment + discount;
    const total = q * puScontato;
    
    return {
        increment,
        discount,
        puScontato,
        total
    };
}

// --- GESTIONE ROUTING / VISTE ---
function switchView(viewName, editingId = null) {
    if (!viewName) viewName = 'dashboard';
    state.activeView = viewName;
    state.editingId = editingId;
    
    // Rimuove la classe attiva da tutti i menu
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
        const dataView = item.getAttribute('data-view');
        if (dataView && dataView.startsWith(viewName.split('-')[0])) {
            item.classList.add('active');
        }
    });
    
    // Nasconde tutte le sezioni
    document.querySelectorAll('.view-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    // Mostra la sezione corretta
    const activeSection = document.getElementById(`view-${viewName}`);
    if (activeSection) {
        activeSection.classList.add('active');
    }
    
    // Trigger rendering specifico
    if (viewName === 'dashboard') {
        renderDashboard();
    } else if (viewName === 'preventivi-list') {
        renderPreventiviList();
    } else if (viewName === 'preventivi-edit') {
        renderPreventivoEditor();
    } else if (viewName === 'consuntivi-list') {
        renderConsuntiviList();
    } else if (viewName === 'consuntivi-edit') {
        state.activeSheetTab = 'riepilogo';
        renderConsuntivoEditor();
    } else if (viewName === 'oreExtra-list') {
        renderOreExtraList();
    } else if (viewName === 'oreExtra-edit') {
        state.activeSheetTab = 'riepilogo';
        renderOreExtraEditor();
    } else if (viewName === 'rapporti-list') {
        renderRapportiList();
    } else if (viewName === 'rapporti-edit') {
        renderRapportiEditor();
    } else if (viewName === 'settings') {
        renderSettings();
    }
    
    // Scroll in alto
    const container = document.querySelector('.view-container');
    if (container) container.scrollTop = 0;
    
    // Inizializza o aggiorna le icone Lucide
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// --- VISTA 1: DASHBOARD ---
let dashboardChartInstance = null;

function renderDashboard() {
    updateDashboardStats();
    updateLastUpdatedDisplay();
    
    // Ricrea il grafico mensile
    const ctx = document.getElementById('dashboardChart');
    if (!ctx) return;
    
    if (dashboardChartInstance) {
        dashboardChartInstance.destroy();
    }
    
    // Calcola i totali preventivati vs consuntivati per mese (Gennaio-Dicembre)
    const ITALIAN_MONTHS = [
        'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
        'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'
    ];
    
    const ITALIAN_MONTHS_CAP = [
        'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
        'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ];
    
    function getMonthIndexFromName(name) {
        if (!name) return null;
        const lowercaseName = name.toLowerCase();
        for (let i = 0; i < ITALIAN_MONTHS.length; i++) {
            if (lowercaseName.includes(ITALIAN_MONTHS[i])) {
                return i;
            }
        }
        return null;
    }
    
    const monthlyPreventivato = Array(12).fill(0);
    const monthlyApprovato = Array(12).fill(0);
    const monthlyConsuntivato = Array(12).fill(0);
    
    const currentYear = new Date().getFullYear();
    
    // 1. Calcola preventivi raggruppati per mese (totale preventivato vs approvato)
    state.preventivi.forEach(p => {
        if (state.activeCommessaId !== 'all' && p.commessaId !== state.activeCommessaId) return;
        if (p.date) {
            const pDate = new Date(p.date);
            const mIndex = pDate.getMonth();
            const pYear = pDate.getFullYear();
            // Accetta l'anno corrente o il 2026 come default per compatibilità campioni
            if (pYear === 2026 || pYear === currentYear) {
                const total = getPreventivoTotal(p);
                // Tutti i preventivi (escluso respinti)
                if (p.status !== 'rejected') {
                    monthlyPreventivato[mIndex] += total;
                }
                // Solo quelli approvati
                if (p.status === 'approved') {
                    monthlyApprovato[mIndex] += total;
                }
            }
        }
    });
    
    // 2. Calcola consuntivi raggruppati per mese
    state.consuntivi.forEach(c => {
        if (state.activeCommessaId !== 'all' && c.commessaId !== state.activeCommessaId) return;
        if (c.status !== 'rejected') {
            (c.months || []).forEach(month => {
                const mIndex = getMonthIndexFromName(month.monthName);
                if (mIndex !== null) {
                    let monthTotal = 0;
                    (month.workReports || []).forEach(rep => {
                        (rep.items || []).forEach(item => {
                            const calcs = calculateItemRow(item.qty, item.price, c.markupPercent, c.discountPercent, item.maggiorata !== false, c.formulaType);
                            monthTotal += calcs.total;
                        });
                    });
                    monthlyConsuntivato[mIndex] += monthTotal;
                }
            });
        }
    });
    
    state.oreExtra.forEach(oe => {
        if (state.activeCommessaId !== 'all' && oe.commessaId !== state.activeCommessaId) return;
        if (oe.status !== 'rejected') {
            (oe.months || []).forEach(month => {
                const mIndex = getMonthIndexFromName(month.monthName);
                if (mIndex !== null) {
                    monthlyConsuntivato[mIndex] += getOreExtraMonthTotal(oe, month);
                }
            });
        }
    });
    
    // Mostra sempre tutti i 12 mesi dell'anno
    const labels = [];
    const preventivatoData = [];
    const approvatoData = [];
    const consuntivatoData = [];
    
    for (let i = 0; i < 12; i++) {
        labels.push(ITALIAN_MONTHS_CAP[i]);
        preventivatoData.push(Number(monthlyPreventivato[i].toFixed(2)));
        approvatoData.push(Number(monthlyApprovato[i].toFixed(2)));
        consuntivatoData.push(Number(monthlyConsuntivato[i].toFixed(2)));
    }
    
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const chartTextColor = currentTheme === 'light' ? '#475569' : '#94a3b8';
    const chartLegendColor = currentTheme === 'light' ? '#0f172a' : '#f8fafc';
    const chartGridColor = currentTheme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)';

    dashboardChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Totale Preventivato (€)',
                    data: preventivatoData,
                    backgroundColor: 'rgba(99, 102, 241, 0.6)',
                    borderColor: '#6366f1',
                    borderWidth: 1
                },
                {
                    label: 'Preventivato Approvato (€)',
                    data: approvatoData,
                    backgroundColor: 'rgba(14, 165, 233, 0.6)',
                    borderColor: '#0ea5e9',
                    borderWidth: 1
                },
                {
                    label: 'Consuntivato Extra (€)',
                    data: consuntivatoData,
                    backgroundColor: 'rgba(20, 184, 166, 0.6)',
                    borderColor: '#14b8a6',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: chartGridColor },
                    ticks: { color: chartTextColor }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: chartTextColor }
                }
            },
            plugins: {
                legend: { labels: { color: chartLegendColor } }
            }
        }
    });
    
    // Renderizza attività recenti
    const activityList = document.getElementById('recent-activities');
    if (activityList) {
        activityList.innerHTML = '';
        
        const activities = [];
        
        // Aggiungi preventivi
        state.preventivi.forEach(p => {
            if (state.activeCommessaId !== 'all' && p.commessaId !== state.activeCommessaId) return;
            const formattedDate = p.date ? new Date(p.date).toLocaleDateString('it-IT') : 'Data n.d.';
            let type = 'blue';
            let statusText = 'in bozza';
            if (p.status === 'approved') {
                type = 'green';
                statusText = 'approvato';
            } else if (p.status === 'sent') {
                type = 'teal';
                statusText = 'inviato';
            } else if (p.status === 'rejected') {
                type = 'red';
                statusText = 'respinto';
            }
            
            activities.push({
                desc: `Preventivo #${p.number} (${statusText}) - Committente: ${p.committente}`,
                dateRaw: p.date ? new Date(p.date) : new Date(0),
                dateStr: formattedDate,
                type: type
            });
        });
        
        // Aggiungi consuntivi
        state.consuntivi.forEach(c => {
            if (state.activeCommessaId !== 'all' && c.commessaId !== state.activeCommessaId) return;
            const formattedDate = c.date ? new Date(c.date).toLocaleDateString('it-IT') : 'Data n.d.';
            let type = 'blue';
            let statusText = 'in bozza';
            if (c.status === 'approved') {
                type = 'green';
                statusText = 'approvato';
            } else if (c.status === 'sent') {
                type = 'teal';
                statusText = 'inviato';
            } else if (c.status === 'rejected') {
                type = 'red';
                statusText = 'respinto';
            }
            
            activities.push({
                desc: `Consuntivo "${c.name}" (${statusText}) - Committente: ${c.committente}`,
                dateRaw: c.date ? new Date(c.date) : new Date(0),
                dateStr: formattedDate,
                type: type
            });
        });
        
        // Aggiungi Ore Extra
        state.oreExtra.forEach(oe => {
            if (state.activeCommessaId !== 'all' && oe.commessaId !== state.activeCommessaId) return;
            const formattedDate = oe.date ? new Date(oe.date).toLocaleDateString('it-IT') : 'Data n.d.';
            let type = 'orange';
            let statusText = 'in bozza';
            if (oe.status === 'approved') {
                type = 'green';
                statusText = 'approvato';
            } else if (oe.status === 'sent') {
                type = 'teal';
                statusText = 'inviato';
            } else if (oe.status === 'rejected') {
                type = 'red';
                statusText = 'respinto';
            }
            
            activities.push({
                desc: `Ore Extra "${oe.name}" (${statusText}) - Committente: ${oe.committente}`,
                dateRaw: oe.date ? new Date(oe.date) : new Date(0),
                dateStr: formattedDate,
                type: type
            });
        });
        
        // Aggiungi rapporti di lavoro
        (state.rapporti || []).forEach(r => {
            if (state.activeCommessaId !== 'all' && r.commessaId !== state.activeCommessaId) return;
            const formattedDate = r.dataLavori ? new Date(r.dataLavori).toLocaleDateString('it-IT') : 'Data n.d.';
            let type = 'green';
            let statusText = 'in bozza';
            if (r.status === 'approved') {
                type = 'green';
                statusText = 'approvato';
            } else if (r.status === 'sent') {
                type = 'teal';
                statusText = 'inviato';
            } else if (r.status === 'rejected') {
                type = 'red';
                statusText = 'respinto';
            }
            
            activities.push({
                desc: `Rapporto Lavoro #${r.number} (${statusText}) - Cliente: ${r.cliente}`,
                dateRaw: r.dataLavori ? new Date(r.dataLavori) : new Date(0),
                dateStr: formattedDate,
                type: type
            });
        });
        
        // Ordina per data decrescente
        activities.sort((a, b) => b.dateRaw - a.dateRaw);
        
        // Mostra le ultime 5 attività
        const recentActs = activities.slice(0, 5);
        
        if (recentActs.length === 0) {
            recentActs.push({ desc: 'Nessuna attività registrata', dateStr: '', type: 'blue' });
        }
        
        recentActs.forEach(act => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            item.innerHTML = `
                <div class="activity-dot ${act.type}"></div>
                <div class="activity-text">
                    <div class="activity-desc">${act.desc}</div>
                    <div class="activity-time">${act.dateStr}</div>
                </div>
            `;
            activityList.appendChild(item);
        });
    }
}

function updateDashboardStats() {
    const isFiltered = state.activeCommessaId !== 'all';
    
    const filteredPrev = isFiltered ? state.preventivi.filter(p => p.commessaId === state.activeCommessaId) : state.preventivi;
    const filteredCons = isFiltered ? state.consuntivi.filter(c => c.commessaId === state.activeCommessaId) : state.consuntivi;
    const filteredOre = isFiltered ? state.oreExtra.filter(oe => oe.commessaId === state.activeCommessaId) : state.oreExtra;
    
    const totalPrevCount = filteredPrev.length;
    
    let totalPrevValue = 0;
    filteredPrev.forEach(p => {
        totalPrevValue += getPreventivoTotal(p);
    });
    
    let totalConsValue = 0;
    filteredCons.forEach(c => {
        totalConsValue += getConsuntivoTotal(c);
    });
    filteredOre.forEach(oe => {
        totalConsValue += getOreExtraTotal(oe);
    });
    
    const countPrevEl = document.getElementById('stat-count-preventivi');
    const valPrevEl = document.getElementById('stat-value-preventivi');
    const countConsEl = document.getElementById('stat-count-consuntivi');
    const valConsEl = document.getElementById('stat-value-consuntivi');
    
    if (countPrevEl) countPrevEl.textContent = totalPrevCount;
    if (valPrevEl) valPrevEl.textContent = formatCurrency(totalPrevValue);
    if (countConsEl) countConsEl.textContent = filteredCons.length + filteredOre.length;
    if (valConsEl) valConsEl.textContent = formatCurrency(totalConsValue);
}

function getPreventivoTotal(prev) {
    let sum = 0;
    const markup = (prev.markupPercent || 15) / 100;
    const discount = (prev.discountPercent || 31) / 100;
    
    (prev.items || []).forEach(item => {
        const calcs = calculateItemRow(item.qty, item.price, prev.markupPercent, prev.discountPercent, item.maggiorata !== false, prev.formulaType);
        sum += calcs.total;
    });
    return sum;
}

function getConsuntivoTotal(cons) {
    let sum = 0;
    (cons.months || []).forEach(month => {
        (month.workReports || []).forEach(rep => {
            (rep.items || []).forEach(item => {
                const calcs = calculateItemRow(item.qty, item.price, cons.markupPercent, cons.discountPercent, item.maggiorata !== false, cons.formulaType);
                sum += calcs.total;
            });
        });
    });
    return sum;
}

function getOreExtraMonthTotal(oe, month) {
    let part1Total = 0;
    const base = oe.costoBase || 18.3;
    const markup = oe.markupPercent || 26.5;
    const discount = oe.discountPercent || 31;
    
    // Part 1: integrazione esercizio H24
    (month.part1 || []).forEach(item => {
        const tariffa = calculateOreExtraTariff(base, markup, discount, item.maggiorazione);
        const totHours = (item.oreGg || 0) * (item.giorni || 0);
        part1Total += totHours * tariffa;
    });
    
    // Part 2: seconda risorsa (diurno)
    let part2Total = 0;
    const tariffaDiurna = calculateOreExtraTariff(base, markup, discount, 0);
    (month.part2 || []).forEach(day => {
        part2Total += (day.hours || 0) * tariffaDiurna;
    });
    
    return part1Total + part2Total;
}

function getOreExtraTotal(oe) {
    let sum = 0;
    (oe.months || []).forEach(month => {
        sum += getOreExtraMonthTotal(oe, month);
    });
    return sum;
}

function calculateOreExtraTariff(baseCost, markupPercent, discountPercent, surchargePercent) {
    const baseSurcharged = baseCost * (1 + surchargePercent);
    const mVal = baseSurcharged * (markupPercent / 100);
    const dVal = mVal * (discountPercent / 100);
    return baseSurcharged + mVal - dVal;
}

// --- VISTA 2: LISTA PREVENTIVI ---
function renderPreventiviList() {
    const tbody = document.getElementById('preventivi-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const searchVal = document.getElementById('search-preventivi')?.value.toLowerCase() || '';
    const statusVal = document.getElementById('filter-preventivi-status')?.value || 'all';
    
    const filtered = state.preventivi.filter(p => {
        const matchCommessa = state.activeCommessaId === 'all' || p.commessaId === state.activeCommessaId;
        const matchSearch = (p.number || '').toLowerCase().includes(searchVal) || 
                            (p.oggetto || '').toLowerCase().includes(searchVal) ||
                            (p.committente || '').toLowerCase().includes(searchVal);
        const matchStatus = statusVal === 'all' || p.status === statusVal;
        return matchCommessa && matchSearch && matchStatus;
    });
    
    filtered.sort((a, b) => (a.oggetto || '').localeCompare(b.oggetto || '', 'it', { sensitivity: 'base' }));
    
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted);">Nessun preventivo trovato</td></tr>`;
        return;
    }
    
    filtered.forEach(p => {
        const tr = document.createElement('tr');
        const total = getPreventivoTotal(p);
        
        let statusBadge = '';
        if (p.status === 'draft') statusBadge = '<span class="badge badge-draft">Bozza</span>';
        else if (p.status === 'sent') statusBadge = '<span class="badge badge-sent">Inviato</span>';
        else if (p.status === 'approved') statusBadge = '<span class="badge badge-approved">Approvato</span>';
        else if (p.status === 'rejected') statusBadge = '<span class="badge badge-rejected">Respinto</span>';
        
        let bilancinoBadge = '<span class="badge badge-draft">---</span>';
        if (p.bilancino === 'OK') bilancinoBadge = '<span class="badge badge-approved">OK</span>';
        else if (p.bilancino === 'NO') bilancinoBadge = '<span class="badge badge-rejected">da inserire</span>';
        
        let rdsRdfBadge = '<span class="badge badge-draft">---</span>';
        if (p.rdsRdf === 'OK') rdsRdfBadge = '<span class="badge badge-approved">OK</span>';
        else if (p.rdsRdf === 'NO') rdsRdfBadge = '<span class="badge badge-rejected">da inserire</span>';
        
        tr.innerHTML = `
            <td><strong>#${p.number || '---'}</strong></td>
            <td>${p.date || '---'}</td>
            <td>${p.committente || '---'}</td>
            <td><div style="max-width: 320px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${p.oggetto}">${p.oggetto || '---'}</div></td>
            <td><strong>${formatCurrency(total)}</strong></td>
            <td>${bilancinoBadge}</td>
            <td>${rdsRdfBadge}</td>
            <td>${statusBadge}</td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-outline btn-icon-only edit-prev-btn" data-id="${p.id}" title="Modifica">
                        <i data-lucide="edit"></i>
                    </button>
                    <button class="btn btn-outline btn-icon-only excel-prev-btn" data-id="${p.id}" title="Esporta Excel" style="color: #22c55e;">
                        <i data-lucide="file-spreadsheet"></i>
                    </button>
                    <button class="btn btn-outline btn-icon-only pdf-prev-btn" data-id="${p.id}" title="Esporta PDF" style="color: #ef4444;">
                        <i data-lucide="file-text"></i>
                    </button>
                    <button class="btn btn-outline btn-icon-only delete-prev-btn" data-id="${p.id}" title="Elimina" style="color: var(--danger);">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    lucide.createIcons();
    attachListEventHandlers();
}

function attachListEventHandlers() {
    // Gestione pulsanti azioni
    document.querySelectorAll('.edit-prev-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            switchView('preventivi-edit', id);
        });
    });
    
    document.querySelectorAll('.excel-prev-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const prev = state.preventivi.find(p => p.id === id);
            if (prev) {
                btn.disabled = true;
                await ExcelExporter.exportPreventivo(prev);
                btn.disabled = false;
            }
        });
    });
    
    document.querySelectorAll('.pdf-prev-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const prev = state.preventivi.find(p => p.id === id);
            if (prev) {
                // Va temporaneamente alla vista editor per catturarla ed esportarla
                switchView('preventivi-edit', id);
                setTimeout(() => {
                    PDFExporter.showPrintPreview(prev, `PREVENTIVO-${prev.number || 'OFFERTA'}.pdf`);
                }, 200);
            }
        });
    });
    
    document.querySelectorAll('.delete-prev-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const prev = state.preventivi.find(p => p.id === id);
            if (confirm(`Sei sicuro di voler eliminare il preventivo #${prev.number || ''}?`)) {
                state.preventivi = state.preventivi.filter(p => p.id !== id);
                saveState();
                renderPreventiviList();
            }
        });
    });
}

// --- VISTA 3: EDITOR PREVENTIVO ---
let activePrevObj = null;

function renderPreventivoEditor() {
    activePrevObj = state.preventivi.find(p => p.id === state.editingId);
    if (!activePrevObj) {
        // Se non lo trova, crea una bozza vuota
        activePrevObj = {
            id: 'prev-' + Date.now(),
            number: String(state.preventivi.length + 1).padStart(5, '0'),
            date: new Date().toISOString().split('T')[0],
            committente: 'RAI',
            presidio: 'RAI MILANO',
            areaLavoro: '',
            areaIntervento: 'C.so Sempione 27 (MI)',
            odl: '',
            prevCode: 'REK/' + new Date().getFullYear() + '/U/ic/000100',
            oggetto: 'Oggetto del preventivo...',
            companyName: 'DIREZIONE OPERATION - AREA LOMBARDIA',
            caPerson: state.settings.caPerson,
            caPerson2: state.settings.caPerson2,
            markupPercent: state.settings.defaultMarkup,
            discountPercent: state.settings.defaultDiscount,
            formulaType: state.settings.defaultFormulaType || 'corretta',
            status: 'draft',
            notes: '',
            conditions: {
                pagamenti: 'Termini contrattuali',
                esclusione: 'Tutto quanto non descritto',
                validita: '30 giorni',
                consegna: '30 giorni data ordine'
            },
            items: []
        };
        state.preventivi.push(activePrevObj);
        saveState();
    }
    
    // Popola i campi di metadati dell'editor HTML
    document.getElementById('prev-meta-company').value = activePrevObj.companyName || '';
    document.getElementById('prev-meta-ca').value = activePrevObj.caPerson || '';
    document.getElementById('prev-meta-ca2').value = activePrevObj.caPerson2 || '';
    document.getElementById('prev-meta-date').value = activePrevObj.date || '';
    document.getElementById('prev-meta-committente').value = activePrevObj.committente || '';
    document.getElementById('prev-meta-num').value = activePrevObj.number || '';
    document.getElementById('prev-meta-presidio').value = activePrevObj.presidio || '';
    document.getElementById('prev-meta-code').value = activePrevObj.prevCode || '';
    document.getElementById('prev-meta-lavoro').value = activePrevObj.areaLavoro || '';
    document.getElementById('prev-meta-odl').value = activePrevObj.odl || '';
    document.getElementById('prev-meta-intervento').value = activePrevObj.areaIntervento || '';
    document.getElementById('prev-meta-oggetto').value = activePrevObj.oggetto || '';
    document.getElementById('prev-meta-author').value = activePrevObj.author || 'Ivan Luca Campagnoli';
    document.getElementById('prev-sheet-author').textContent = activePrevObj.author || 'Ivan Luca Campagnoli';
    document.getElementById('prev-notes-input').value = activePrevObj.notes || '';
    
    // Percentuali ricarico e sconto
    document.getElementById('prev-edit-markup').value = activePrevObj.markupPercent;
    document.getElementById('prev-edit-discount').value = activePrevObj.discountPercent;
    document.getElementById('prev-edit-formula').value = activePrevObj.formulaType || 'corretta';
    document.getElementById('prev-edit-status').value = activePrevObj.status;
    document.getElementById('prev-edit-bilancino').value = activePrevObj.bilancino || '';
    updatePreventivoMarginDisplay();
    
    // Condizioni contrattuali
    const cond = activePrevObj.conditions || {};
    document.getElementById('prev-cond-pagamenti').value = cond.pagamenti || '';
    document.getElementById('prev-cond-esclusione').value = cond.esclusione || '';
    document.getElementById('prev-cond-validita').value = cond.validita || '';
    document.getElementById('prev-cond-consegna').value = cond.consegna || '';
    
    // Renderizza le tabelle delle voci
    renderPreventivoTables();
}

function renderPreventivoTables() {
    const tbodyMateriali = document.getElementById('prev-materiali-tbody');
    const tbodyManodopera = document.getElementById('prev-manodopera-tbody');
    
    tbodyMateriali.innerHTML = '';
    tbodyManodopera.innerHTML = '';
    
    const items = activePrevObj.items || [];
    const materialiItems = items.filter(it => it.type !== 'manodopera');
    const manodoperaItems = items.filter(it => it.type === 'manodopera');
    
    const markup = activePrevObj.markupPercent;
    const discount = activePrevObj.discountPercent;
    
    // 1. Render Materiali
    materialiItems.forEach((item, index) => {
        const tr = document.createElement('tr');
        const calcs = calculateItemRow(item.qty, item.price, markup, discount, item.maggiorata !== false);
        
        tr.innerHTML = `
            <td class="cell-center"><input type="checkbox" class="item-maggiorata" ${item.maggiorata !== false ? 'checked' : ''}></td>
            <td class="editable-cell"><input type="text" class="cell-input item-listino" value="${item.listino || ''}"></td>
            <td class="editable-cell"><input type="text" class="cell-input item-voci cell-center" value="${item.voci || ''}"></td>
            <td class="editable-cell"><input type="text" class="cell-input item-desc" value="${item.descrizione || ''}"></td>
            <td><input type="text" class="cell-input item-um cell-center" value="${item.um || 'cad'}"></td>
            <td class="editable-cell"><input type="number" class="cell-input item-qty cell-right" value="${item.qty}" step="any"></td>
            <td class="editable-cell"><input type="number" class="cell-input item-price cell-right" value="${item.price}" step="any"></td>
            <td class="cell-right cell-readonly" data-calc="markup">${formatNumber(calcs.increment, 2)} €</td>
            <td class="cell-right cell-readonly" data-calc="discount">${formatNumber(calcs.discount, 2)} €</td>
            <td class="cell-right cell-readonly cell-bold" data-calc="scontato">${formatNumber(calcs.puScontato, 2)} €</td>
            <td class="cell-right cell-readonly cell-bold" data-calc="totale">${formatCurrency(calcs.total)}</td>
            <td class="row-actions-td">
                <button class="row-action-btn delete-item-row" data-id="${item.id}" title="Elimina Riga">
                    <i data-lucide="minus-circle"></i>
                </button>
            </td>
        `;
        tbodyMateriali.appendChild(tr);
    });
    
    // Riga Totale Materiali
    const totalMat = materialiItems.reduce((sum, item) => {
        const calcs = calculateItemRow(item.qty, item.price, markup, discount, item.maggiorata !== false);
        return sum + calcs.total;
    }, 0);
    
    const trTotalMat = document.createElement('tr');
    trTotalMat.className = 'excel-total-row';
    trTotalMat.innerHTML = `
        <td colspan="10" class="cell-bold">TOTALE MATERIALI</td>
        <td class="cell-right cell-bold" id="prev-total-materiali">${formatCurrency(totalMat)}</td>
        <td class="row-actions-td"></td>
    `;
    tbodyMateriali.appendChild(trTotalMat);
    
    // 2. Render Manodopera
    manodoperaItems.forEach((item, index) => {
        const tr = document.createElement('tr');
        const calcs = calculateItemRow(item.qty, item.price, markup, discount, item.maggiorata !== false);
        
        tr.innerHTML = `
            <td class="cell-center"><input type="checkbox" class="item-maggiorata" ${item.maggiorata !== false ? 'checked' : ''}></td>
            <td class="editable-cell"><input type="text" class="cell-input item-listino" value="${item.listino || ''}"></td>
            <td class="editable-cell"><input type="text" class="cell-input item-voci cell-center" value="${item.voci || ''}"></td>
            <td class="editable-cell"><input type="text" class="cell-input item-desc" value="${item.descrizione || ''}"></td>
            <td><input type="text" class="cell-input item-um cell-center" value="${item.um || 'ore'}"></td>
            <td class="editable-cell"><input type="number" class="cell-input item-qty cell-right" value="${item.qty}" step="any"></td>
            <td class="editable-cell"><input type="number" class="cell-input item-price cell-right" value="${item.price}" step="any"></td>
            <td class="cell-right cell-readonly" data-calc="markup">${formatNumber(calcs.increment, 2)} €</td>
            <td class="cell-right cell-readonly" data-calc="discount">${formatNumber(calcs.discount, 2)} €</td>
            <td class="cell-right cell-readonly cell-bold" data-calc="scontato">${formatNumber(calcs.puScontato, 2)} €</td>
            <td class="cell-right cell-readonly cell-bold" data-calc="totale">${formatCurrency(calcs.total)}</td>
            <td class="row-actions-td">
                <button class="row-action-btn delete-item-row" data-id="${item.id}" title="Elimina Riga">
                    <i data-lucide="minus-circle"></i>
                </button>
            </td>
        `;
        tbodyManodopera.appendChild(tr);
    });
    
    // Riga Totale Manodopera
    const totalMano = manodoperaItems.reduce((sum, item) => {
        const calcs = calculateItemRow(item.qty, item.price, markup, discount, item.maggiorata !== false);
        return sum + calcs.total;
    }, 0);
    
    const trTotalMano = document.createElement('tr');
    trTotalMano.className = 'excel-total-row';
    trTotalMano.innerHTML = `
        <td colspan="10" class="cell-bold"> TOTALE MANODOPERA</td>
        <td class="cell-right cell-bold" id="prev-total-manodopera">${formatCurrency(totalMano)}</td>
        <td class="row-actions-td"></td>
    `;
    tbodyManodopera.appendChild(trTotalMano);
    
    // 3. Totale Generale Offerta
    const totalGeneral = totalMat + totalMano;
    document.getElementById('prev-total-general').textContent = formatCurrency(totalGeneral);
    
    lucide.createIcons();
    attachEditorEventHandlers();
}

function attachEditorEventHandlers() {
    // Salva metadati alla modifica dei campi di testo dell'intestazione
    const metaInputs = [
        { id: 'prev-meta-company', field: 'companyName' },
        { id: 'prev-meta-ca', field: 'caPerson' },
        { id: 'prev-meta-ca2', field: 'caPerson2' },
        { id: 'prev-meta-date', field: 'date' },
        { id: 'prev-meta-committente', field: 'committente' },
        { id: 'prev-meta-num', field: 'number' },
        { id: 'prev-meta-presidio', field: 'presidio' },
        { id: 'prev-meta-code', field: 'prevCode' },
        { id: 'prev-meta-lavoro', field: 'areaLavoro' },
        { id: 'prev-meta-odl', field: 'odl' },
        { id: 'prev-meta-intervento', field: 'areaIntervento' },
        { id: 'prev-meta-oggetto', field: 'oggetto' },
        { id: 'prev-meta-author', field: 'author' },
        { id: 'prev-notes-input', field: 'notes' }
    ];
    
    metaInputs.forEach(m => {
        const el = document.getElementById(m.id);
        if (el) {
            el.addEventListener('change', (e) => {
                activePrevObj[m.field] = e.target.value;
                if (m.field === 'author') {
                    const sheetEl = document.getElementById('prev-sheet-author');
                    if (sheetEl) sheetEl.textContent = e.target.value;
                }
                saveState();
            });
        }
    });
    
    // Condizioni contrattuali
    const condFields = ['pagamenti', 'esclusione', 'validita', 'consegna'];
    condFields.forEach(f => {
        const el = document.getElementById(`prev-cond-${f}`);
        if (el) {
            el.addEventListener('change', (e) => {
                if (!activePrevObj.conditions) activePrevObj.conditions = {};
                activePrevObj.conditions[f] = e.target.value;
                saveState();
            });
        }
    });
    
    // Ricarichi, sconto e stato (in alto a destra dell'editor)
    document.getElementById('prev-edit-markup').addEventListener('change', (e) => {
        activePrevObj.markupPercent = Number(e.target.value) || 0;
        saveState();
        updatePreventivoMarginDisplay();
        renderPreventivoTables();
    });
    document.getElementById('prev-edit-discount').addEventListener('change', (e) => {
        activePrevObj.discountPercent = Number(e.target.value) || 0;
        saveState();
        updatePreventivoMarginDisplay();
        renderPreventivoTables();
    });
    document.getElementById('prev-edit-formula').addEventListener('change', (e) => {
        activePrevObj.formulaType = e.target.value;
        saveState();
        updatePreventivoMarginDisplay();
        renderPreventivoTables();
    });
    document.getElementById('prev-edit-status').addEventListener('change', (e) => {
        activePrevObj.status = e.target.value;
        saveState();
    });
    document.getElementById('prev-edit-bilancino').addEventListener('change', (e) => {
        activePrevObj.bilancino = e.target.value;
        saveState();
    });
    // Listener di input per la modifica in-line degli elementi in griglia
    const attachTableInputListeners = (tbody, itemType) => {
        tbody.querySelectorAll('tr').forEach((tr, index) => {
            if (tr.classList.contains('excel-total-row')) return;
            
            // Trova l'id reale dell'oggetto nella lista
            const itemsOfType = activePrevObj.items.filter(it => 
                itemType === 'materiali' ? it.type !== 'manodopera' : it.type === 'manodopera'
            );
            const itemObj = itemsOfType[index];
            if (!itemObj) return;
            
            const listinoInput = tr.querySelector('.item-listino');
            const vociInput = tr.querySelector('.item-voci');
            const descInput = tr.querySelector('.item-desc');
            const umInput = tr.querySelector('.item-um');
            const qtyInput = tr.querySelector('.item-qty');
            const priceInput = tr.querySelector('.item-price');
            const maggiorataCheckbox = tr.querySelector('.item-maggiorata');
            
            const handleInputChange = () => {
                itemObj.listino = listinoInput.value;
                itemObj.voci = vociInput.value;
                itemObj.descrizione = descInput.value;
                itemObj.um = umInput.value;
                itemObj.qty = Number(qtyInput.value) || 0;
                itemObj.price = Number(priceInput.value) || 0;
                itemObj.maggiorata = maggiorataCheckbox.checked;
                
                // Ricalcola in tempo reale sulla riga corrente prima del save generale
                const calcs = calculateItemRow(itemObj.qty, itemObj.price, activePrevObj.markupPercent, activePrevObj.discountPercent, itemObj.maggiorata);
                tr.querySelector('[data-calc="markup"]').textContent = formatNumber(calcs.increment, 4) + ' €';
                tr.querySelector('[data-calc="discount"]').textContent = formatNumber(calcs.discount, 4) + ' €';
                tr.querySelector('[data-calc="scontato"]').textContent = formatNumber(calcs.puScontato, 6) + ' €';
                tr.querySelector('[data-calc="totale"]').textContent = formatCurrency(calcs.total);
                
                // Salva lo stato e ricalcola i totali globali
                saveState();
                
                // Ricalcola totali di sezione e generali velocemente
                recalculatePreventivoTotals();
            };
            
            [listinoInput, vociInput, descInput, umInput, qtyInput, priceInput].forEach(inp => {
                inp.addEventListener('input', handleInputChange);
            });
            maggiorataCheckbox.addEventListener('change', handleInputChange);
        });
    };
    
    attachTableInputListeners(document.getElementById('prev-materiali-tbody'), 'materiali');
    attachTableInputListeners(document.getElementById('prev-manodopera-tbody'), 'manodopera');
    
    // Gestione eliminazione riga
    document.querySelectorAll('.delete-item-row').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemId = e.currentTarget.getAttribute('data-id');
            activePrevObj.items = activePrevObj.items.filter(it => it.id !== itemId);
            saveState();
            renderPreventivoTables();
        });
    });
}

function recalculatePreventivoTotals() {
    const markup = activePrevObj.markupPercent;
    const discount = activePrevObj.discountPercent;
    
    const totalMat = activePrevObj.items
        .filter(it => it.type !== 'manodopera')
        .reduce((sum, item) => sum + calculateItemRow(item.qty, item.price, markup, discount, item.maggiorata !== false).total, 0);
        
    const totalMano = activePrevObj.items
        .filter(it => it.type === 'manodopera')
        .reduce((sum, item) => sum + calculateItemRow(item.qty, item.price, markup, discount, item.maggiorata !== false).total, 0);
        
    document.getElementById('prev-total-materiali').textContent = formatCurrency(totalMat);
    document.getElementById('prev-total-manodopera').textContent = formatCurrency(totalMano);
    document.getElementById('prev-total-general').textContent = formatCurrency(totalMat + totalMano);
}

// Aggiunta riga preventivo
function addPreventivoRow(type) {
    if (!activePrevObj) return;
    
    const newItem = {
        id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        listino: type === 'materiali' ? '' : 'Manodopera',
        voci: 'N.P.',
        descrizione: type === 'materiali' ? 'Nuovo materiale...' : 'Nuova manodopera...',
        um: type === 'materiali' ? 'cad' : 'ore',
        qty: 1,
        price: 0,
        type: type
    };
    
    activePrevObj.items.push(newItem);
    saveState();
    renderPreventivoTables();
}

// --- VISTA 4: LISTA CONSUNTIVI ---
function renderConsuntiviList() {
    const tbody = document.getElementById('consuntivi-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const searchVal = document.getElementById('search-consuntivi')?.value.toLowerCase() || '';
    const statusVal = document.getElementById('filter-consuntivi-status')?.value || 'all';
    
    const filtered = state.consuntivi.filter(c => {
        const matchCommessa = state.activeCommessaId === 'all' || c.commessaId === state.activeCommessaId;
        const matchSearch = (c.name || '').toLowerCase().includes(searchVal) || 
                            (c.oggetto || '').toLowerCase().includes(searchVal) ||
                            (c.committente || '').toLowerCase().includes(searchVal) ||
                            (c.presidio || '').toLowerCase().includes(searchVal);
        const matchStatus = statusVal === 'all' || (c.status || 'draft') === statusVal;
        return matchCommessa && matchSearch && matchStatus;
    });
    
    filtered.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'it', { sensitivity: 'base' }));
    
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted);">Nessun consuntivo trovato</td></tr>`;
        return;
    }
    
    filtered.forEach(c => {
        const tr = document.createElement('tr');
        const total = getConsuntivoTotal(c);
        
        let statusBadge = '';
        const status = c.status || 'draft';
        if (status === 'draft') statusBadge = '<span class="badge badge-draft">Bozza</span>';
        else if (status === 'sent') statusBadge = '<span class="badge badge-sent">Inviato</span>';
        else if (status === 'approved') statusBadge = '<span class="badge badge-approved">Approvato</span>';
        else if (status === 'rejected') statusBadge = '<span class="badge badge-rejected">Respinto</span>';
        
        let bilancinoBadge = '<span class="badge badge-draft">---</span>';
        if (c.bilancino === 'OK') bilancinoBadge = '<span class="badge badge-approved">OK</span>';
        else if (c.bilancino === 'NO') bilancinoBadge = '<span class="badge badge-rejected">da inserire</span>';
        
        // Calcola in automatico lo stato RDS/RDF in base ai codici dei rapporti di lavoro del consuntivo
        let hasReports = false;
        let allFilled = true;
        if (c.months && c.months.length > 0) {
            c.months.forEach(m => {
                if (m.workReports && m.workReports.length > 0) {
                    hasReports = true;
                    m.workReports.forEach(rep => {
                        if (!rep.rdsCode || !rep.rdsCode.trim() || !rep.rdfCode || !rep.rdfCode.trim()) {
                            allFilled = false;
                        }
                    });
                }
            });
        }
        
        let rdsRdfBadge = '<span class="badge badge-draft">---</span>';
        if (hasReports) {
            if (allFilled) {
                rdsRdfBadge = '<span class="badge badge-approved">OK</span>';
            } else {
                rdsRdfBadge = '<span class="badge badge-rejected">da inserire</span>';
            }
        }
        
        tr.innerHTML = `
            <td><strong>${c.name || '---'}</strong></td>
            <td>${c.date || '---'}</td>
            <td>${c.committente || '---'}</td>
            <td>${c.presidio || '---'}</td>
            <td><strong>${formatCurrency(total)}</strong></td>
            <td>${bilancinoBadge}</td>
            <td>${rdsRdfBadge}</td>
            <td>${statusBadge}</td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-outline btn-icon-only edit-cons-btn" data-id="${c.id}" title="Modifica">
                        <i data-lucide="edit"></i>
                    </button>
                    <button class="btn btn-outline btn-icon-only excel-cons-btn" data-id="${c.id}" title="Esporta Excel" style="color: #22c55e;">
                        <i data-lucide="file-spreadsheet"></i>
                    </button>
                    <button class="btn btn-outline btn-icon-only pdf-cons-btn" data-id="${c.id}" title="Esporta PDF" style="color: #ef4444;">
                        <i data-lucide="file-text"></i>
                    </button>
                    <button class="btn btn-outline btn-icon-only delete-cons-btn" data-id="${c.id}" title="Elimina" style="color: var(--danger);">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    lucide.createIcons();
    attachConsListEventHandlers();
}

function attachConsListEventHandlers() {
    document.querySelectorAll('.edit-cons-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            switchView('consuntivi-edit', id);
        });
    });
    
    document.querySelectorAll('.excel-cons-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const cons = state.consuntivi.find(c => c.id === id);
            if (cons) {
                btn.disabled = true;
                await ExcelExporter.exportConsuntivo(cons);
                btn.disabled = false;
            }
        });
    });
    
    document.querySelectorAll('.pdf-cons-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const cons = state.consuntivi.find(c => c.id === id);
            if (cons) {
                switchView('consuntivi-edit', id);
                setTimeout(() => {
                    PDFExporter.showConsuntivoPreview(cons);
                }, 200);
            }
        });
    });
    
    document.querySelectorAll('.delete-cons-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const cons = state.consuntivi.find(c => c.id === id);
            if (confirm(`Sei sicuro di voler eliminare il consuntivo "${cons.name || ''}"?`)) {
                state.consuntivi = state.consuntivi.filter(c => c.id !== id);
                saveState();
                renderConsuntiviList();
            }
        });
    });
}

// --- VISTA 5: EDITOR CONSUNTIVO ---
let activeConsObj = null;

function renderConsuntivoEditor() {
    activeConsObj = state.consuntivi.find(c => c.id === state.editingId);
    if (!activeConsObj) {
        activeConsObj = {
            id: 'cons-' + Date.now(),
            name: `CONSUNTIVO EXTRA CANONE ${new Date().getFullYear()}`,
            committente: 'RAI',
            presidio: 'RAI MILANO',
            areaIntervento: 'C.so Sempione 27 (MI)',
            odl: '',
            date: new Date().toISOString().split('T')[0],
            companyName: 'DIREZIONE OPERATION - AREA LOMBARDIA',
            caPerson: state.settings.caPerson,
            caPerson2: state.settings.caPerson2,
            markupPercent: state.settings.defaultMarkup,
            discountPercent: state.settings.defaultDiscount,
            formulaType: state.settings.defaultFormulaType || 'corretta',
            oggetto: 'OGGETTO: RIEPILOGO CONSUNTIVI LAVORAZIONI EXTRA CANONE',
            extraCanoneText: 'MANUTENZIONE  EXTRA CANONE',
            status: 'draft',
            months: []
        };
        state.consuntivi.push(activeConsObj);
        saveState();
    }
    
    // Popola i metadati comuni
    document.getElementById('cons-meta-company').value = activeConsObj.companyName || '';
    document.getElementById('cons-meta-ca').value = activeConsObj.caPerson || '';
    document.getElementById('cons-meta-ca2').value = activeConsObj.caPerson2 || '';
    document.getElementById('cons-meta-date').value = activeConsObj.date || '';
    document.getElementById('cons-meta-committente').value = activeConsObj.committente || '';
    document.getElementById('cons-meta-presidio').value = activeConsObj.presidio || '';
    document.getElementById('cons-meta-odl').value = activeConsObj.odl || '';
    document.getElementById('cons-meta-prevcode').value = activeConsObj.prevCode || '';
    document.getElementById('cons-meta-intervento').value = activeConsObj.areaIntervento || '';
    document.getElementById('cons-meta-oggetto').value = activeConsObj.oggetto || '';
    document.getElementById('cons-meta-name').value = activeConsObj.name || '';
    document.getElementById('cons-edit-status').value = activeConsObj.status || 'draft';
    document.getElementById('cons-edit-bilancino').value = activeConsObj.bilancino || '';
    
    document.getElementById('cons-edit-markup').value = activeConsObj.markupPercent;
    document.getElementById('cons-edit-discount').value = activeConsObj.discountPercent;
    document.getElementById('cons-edit-formula').value = activeConsObj.formulaType || 'corretta';
    updateConsuntivoMarginDisplay();
    
    // Renderizza le schede dei fogli (Riepilogo + Mesi)
    renderSheetTabs();
}

function renderSheetTabs() {
    const tabsContainer = document.getElementById('consuntivo-tabs-container');
    if (!tabsContainer) return;
    
    tabsContainer.innerHTML = '';
    
    // 1. Tab Riepilogo
    const tabRiepilogo = document.createElement('div');
    tabRiepilogo.className = `sheet-tab ${state.activeSheetTab === 'riepilogo' ? 'active' : ''}`;
    tabRiepilogo.innerHTML = `<i data-lucide="file-bar-chart-2"></i> Riepilogo`;
    tabRiepilogo.addEventListener('click', () => {
        state.activeSheetTab = 'riepilogo';
        renderSheetTabs();
    });
    tabsContainer.appendChild(tabRiepilogo);
    
    // 2. Tab dei mesi
    (activeConsObj.months || []).forEach((m, index) => {
        const tabMonth = document.createElement('div');
        tabMonth.className = `sheet-tab ${state.activeSheetTab === m.id ? 'active' : ''}`;
        
        const isFirst = index === 0;
        const isLast = index === (activeConsObj.months || []).length - 1;
        
        tabMonth.innerHTML = `
            <div class="tab-reorder-actions">
                ${!isFirst ? `<button class="tab-action-btn move-left-btn" data-id="${m.id}" title="Sposta a sinistra">&#9664;</button>` : ''}
                ${!isLast ? `<button class="tab-action-btn move-right-btn" data-id="${m.id}" title="Sposta a destra">&#9654;</button>` : ''}
            </div>
            <i data-lucide="calendar"></i> ${m.monthName}
            <button class="tab-close-btn remove-month-btn" data-id="${m.id}">&times;</button>
        `;
        tabMonth.draggable = true;
        
        tabMonth.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-month-btn') || e.target.closest('.tab-reorder-actions')) return;
            state.activeSheetTab = m.id;
            renderSheetTabs();
        });
        
        // click listeners for moving
        const btnLeft = tabMonth.querySelector('.move-left-btn');
        if (btnLeft) {
            btnLeft.addEventListener('click', (e) => {
                e.stopPropagation();
                const months = activeConsObj.months;
                const idx = months.findIndex(item => item.id === m.id);
                if (idx > 0) {
                    const [temp] = months.splice(idx, 1);
                    months.splice(idx - 1, 0, temp);
                    saveState();
                    renderSheetTabs();
                }
            });
        }
        
        const btnRight = tabMonth.querySelector('.move-right-btn');
        if (btnRight) {
            btnRight.addEventListener('click', (e) => {
                e.stopPropagation();
                const months = activeConsObj.months;
                const idx = months.findIndex(item => item.id === m.id);
                if (idx < months.length - 1) {
                    const [temp] = months.splice(idx, 1);
                    months.splice(idx + 1, 0, temp);
                    saveState();
                    renderSheetTabs();
                }
            });
        }
        
        tabMonth.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', m.id);
            tabMonth.classList.add('dragging');
        });
        
        tabMonth.addEventListener('dragend', () => {
            tabMonth.classList.remove('dragging');
            document.querySelectorAll('.sheet-tab').forEach(t => t.classList.remove('drag-over'));
        });
        
        tabMonth.addEventListener('dragover', (e) => {
            e.preventDefault();
            tabMonth.classList.add('drag-over');
        });
        
        tabMonth.addEventListener('dragleave', () => {
            tabMonth.classList.remove('drag-over');
        });
        
        tabMonth.addEventListener('drop', (e) => {
            e.preventDefault();
            tabMonth.classList.remove('drag-over');
            const draggedId = e.dataTransfer.getData('text/plain');
            const targetId = m.id;
            if (draggedId && draggedId !== targetId) {
                const months = activeConsObj.months;
                const dragIdx = months.findIndex(item => item.id === draggedId);
                const targetIdx = months.findIndex(item => item.id === targetId);
                if (dragIdx !== -1 && targetIdx !== -1) {
                    const [draggedMonth] = months.splice(dragIdx, 1);
                    months.splice(targetIdx, 0, draggedMonth);
                    saveState();
                    renderSheetTabs();
                }
            }
        });
        
        tabsContainer.appendChild(tabMonth);
    });
    
    // 3. Pulsante aggiungi scheda mese
    const addTabBtn = document.createElement('div');
    addTabBtn.className = 'sheet-tab';
    addTabBtn.style.borderLeft = 'none';
    addTabBtn.style.background = 'rgba(20, 184, 166, 0.15)';
    addTabBtn.style.color = 'var(--secondary)';
    addTabBtn.innerHTML = `<i data-lucide="plus"></i> Aggiungi Mese`;
    addTabBtn.addEventListener('click', () => {
        openAddMonthModal();
    });
    tabsContainer.appendChild(addTabBtn);
    
    lucide.createIcons();
    
    // Aggancia gestore eliminazione schede
    document.querySelectorAll('.remove-month-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = e.currentTarget.getAttribute('data-id');
            const month = activeConsObj.months.find(m => m.id === id);
            if (confirm(`Sei sicuro di voler rimuovere la scheda "${month.monthName}"?`)) {
                activeConsObj.months = activeConsObj.months.filter(m => m.id !== id);
                if (state.activeSheetTab === id) {
                    state.activeSheetTab = 'riepilogo';
                }
                saveState();
                renderSheetTabs();
            }
        });
    });
    
    // Renderizza il foglio/contenuto corrente
    renderActiveSheetContent();
}

function renderActiveSheetContent() {
    const sheetBody = document.getElementById('consuntivo-sheet-body');
    if (!sheetBody) return;
    
    sheetBody.innerHTML = '';
    
    if (state.activeSheetTab === 'riepilogo') {
        renderRiepilogoSheet(sheetBody);
    } else {
        const monthObj = activeConsObj.months.find(m => m.id === state.activeSheetTab);
        if (monthObj) {
            renderMonthSheet(sheetBody, monthObj);
        }
    }
}

// Render Foglio Riepilogo
function renderRiepilogoSheet(container) {
    const section = document.createElement('div');
    section.innerHTML = `
        <div class="sheet-title-section">
            <h3 id="riepilogo-title-obj">${activeConsObj.oggetto || 'RIEPILOGO CONSUNTIVI'}</h3>
            <h4>COMPUTO METRICO ESTIMATIVO</h4>
        </div>
        <table class="excel-table">
            <thead>
                <tr>
                    <th>NUMERO RAPPORTO DI LAVORO REKEEP</th>
                    <th style="width: 25%">PREZIARIO REGIONE LOMBARDIA 2022</th>
                    <th style="width: 25%">NUOVO PREZZO</th>
                    <th style="width: 25%">IMPORTO</th>
                </tr>
            </thead>
            <tbody id="riepilogo-table-body">
                <!-- Voci dinamiche aggregate -->
            </tbody>
        </table>
    `;
    container.appendChild(section);
    
    const tbody = document.getElementById('riepilogo-table-body');
    let totalRiepilogo = 0;
    let totalLombardia = 0;
    let totalNuovoPrezzo = 0;
    
    // Cicla tra tutti i rapporti di lavoro di tutti i mesi per aggregarli
    const markup = activeConsObj.markupPercent;
    const discount = activeConsObj.discountPercent;
    
    let countRapporti = 0;
    (activeConsObj.months || []).forEach(m => {
        const isLombardia = m.monthName && (
            m.monthName.toUpperCase().includes('REG LOMB') || 
            m.monthName.toUpperCase().includes('LOMBARDIA') || 
            m.monthName.toUpperCase().includes('PREZIARIO')
        );
        (m.workReports || []).forEach(rep => {
            countRapporti++;
            const tr = document.createElement('tr');
            
            // Calcola il totale del rapporto di lavoro
            const totalRep = (rep.items || []).reduce((sum, item) => {
                return sum + calculateItemRow(item.qty, item.price, markup, discount, item.maggiorata !== false, activeConsObj.formulaType).total;
            }, 0);
            
            const lombardiaVal = isLombardia ? totalRep : 0;
            const nuovoPrezzoVal = isLombardia ? 0 : totalRep;
            
            totalRiepilogo += totalRep;
            totalLombardia += lombardiaVal;
            totalNuovoPrezzo += nuovoPrezzoVal;
            
            tr.innerHTML = `
                <td class="cell-bold">RAPPORTO DI LAVORO N° : ${rep.reportId || '---'}</td>
                <td class="cell-right cell-readonly ${isLombardia ? 'cell-bold cell-formula' : ''}" title="Collegato a ${m.monthName}">${formatCurrency(lombardiaVal)}</td>
                <td class="cell-right cell-readonly ${!isLombardia ? 'cell-bold cell-formula' : ''}" title="Collegato a ${m.monthName}">${formatCurrency(nuovoPrezzoVal)}</td>
                <td class="cell-right cell-readonly cell-bold">${formatCurrency(totalRep)}</td>
            `;
            tbody.appendChild(tr);
        });
    });
    
    if (countRapporti === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 20px;">Nessun rapporto di lavoro inserito. Aggiungi un mese e crea un rapporto di lavoro.</td></tr>`;
        return;
    }
    
    // Riga Totale Generale Riepilogo
    const trTotal = document.createElement('tr');
    trTotal.className = 'excel-total-row';
    trTotal.innerHTML = `
        <td class="cell-bold" style="text-align: right;">Totale</td>
        <td class="cell-right cell-bold">${formatCurrency(totalLombardia)}</td>
        <td class="cell-right cell-bold">${formatCurrency(totalNuovoPrezzo)}</td>
        <td class="cell-right cell-bold">${formatCurrency(totalRiepilogo)}</td>
    `;
    tbody.appendChild(trTotal);
}

// Render Foglio Mensile (es. Aprile, Maggio...)
function renderMonthSheet(container, monthObj) {
    const section = document.createElement('div');
    section.innerHTML = `
        <div class="sheet-title-section">
            <h3>CONSUNTIVO LAVORAZIONI EXTRA CANONE ${monthObj.monthName.toUpperCase()}</h3>
        </div>
        <div id="rapporti-lavoro-container">
            <!-- Rapporti di lavoro qui -->
        </div>
        <div class="add-row-btn-container" style="margin-top: 20px;">
            <button class="btn btn-secondary" id="add-rapporto-btn">
                <i data-lucide="plus-circle"></i> Aggiungi Rapporto di Lavoro
            </button>
        </div>
    `;
    container.appendChild(section);
    
    // Renderizza i Rapporti di Lavoro
    const repContainer = document.getElementById('rapporti-lavoro-container');
    const reports = monthObj.workReports || [];
    
    if (reports.length === 0) {
        repContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 40px; border: 1px dashed var(--border-color); border-radius: 8px;">Nessun Rapporto di Lavoro presente. Aggiungine uno per inserire le lavorazioni.</div>`;
    }
    
    const markup = activeConsObj.markupPercent;
    const discount = activeConsObj.discountPercent;
    
    reports.forEach((rep, repIdx) => {
        const repDiv = document.createElement('div');
        repDiv.className = 'rapporto-section';
        
        // Calcola totale rapporto
        const repTotalVal = (rep.items || []).reduce((sum, item) => {
            return sum + calculateItemRow(item.qty, item.price, markup, discount, item.maggiorata !== false).total;
        }, 0);
        
        let bilancinoBadge = '';
        if (rep.bilancino === 'OK') bilancinoBadge = '<span class="badge badge-approved" style="margin-left: 8px; font-size: 0.75rem; padding: 2px 6px;">Bilancino: OK</span>';
        else if (rep.bilancino === 'NO') bilancinoBadge = '<span class="badge badge-rejected" style="margin-left: 8px; font-size: 0.75rem; padding: 2px 6px;">Bilancino: da inserire</span>';
        
        let rdsCodeBadge = '';
        if (rep.rdsCode) {
            rdsCodeBadge = `<span class="badge" style="margin-left: 8px; font-size: 0.75rem; padding: 2px 6px; background: rgba(59, 130, 246, 0.15); color: #3b82f6; text-transform: none;">RDS: ${rep.rdsCode}</span>`;
        }
        
        let rdfCodeBadge = '';
        if (rep.rdfCode) {
            rdfCodeBadge = `<span class="badge" style="margin-left: 8px; font-size: 0.75rem; padding: 2px 6px; background: rgba(168, 85, 247, 0.15); color: #a855f7; text-transform: none;">RDF: ${rep.rdfCode}</span>`;
        }
        
        repDiv.innerHTML = `
            <div class="rapporto-header">
                <div class="rapporto-title-group">
                    <i data-lucide="chevron-down" class="toggle-icon"></i>
                    <h4>RAPPORTO DI LAVORO N°: <strong>${rep.reportId || '(Non Specificato)'}</strong> ${rep.dateText || ''} ${bilancinoBadge} ${rdsCodeBadge} ${rdfCodeBadge}</h4>
                </div>
                <div style="display: flex; align-items: center; gap: 16px;">
                    <span style="font-size: 0.85rem; color: var(--text-secondary);">Totale: <strong>${formatCurrency(repTotalVal)}</strong></span>
                    <button class="btn btn-outline btn-icon-only edit-rep-meta-btn" data-id="${rep.id}" title="Modifica Numero/Data" style="width: 28px; height: 28px;">
                        <i data-lucide="edit-3" style="width: 14px; height: 14px;"></i>
                    </button>
                    <button class="btn btn-outline btn-icon-only delete-rep-btn" data-id="${rep.id}" title="Elimina Rapporto" style="width: 28px; height: 28px; color: var(--danger);">
                        <i data-lucide="trash" style="width: 14px; height: 14px;"></i>
                    </button>
                </div>
            </div>
            <div class="rapporto-body">
                <div style="overflow-x: auto; width: 100%; margin-bottom: 12px; border-radius: 4px;">
                    <table class="excel-table" style="min-width: 1200px; margin-bottom: 0;">
                        <thead>
                            <tr>
                                <th style="width: 60px; min-width: 50px;">Magg.</th>
                                <th style="width: 100px; min-width: 100px;">Listino</th>
                                <th style="width: 180px; min-width: 150px;">Voci</th>
                                <th style="min-width: 350px;">Descrizione sintetica delle lavorazioni</th>
                                <th style="width: 60px; min-width: 60px;">U.M.</th>
                                <th style="width: 80px; min-width: 80px;">Q.tà</th>
                                <th style="width: 110px; min-width: 110px;">Prezzo unitario</th>
                                <th style="width: 110px; min-width: 110px;">Incr. ${markup}% contr.</th>
                                <th style="width: 110px; min-width: 110px;">Sconto Gara ${discount}%</th>
                                <th style="width: 110px; min-width: 110px;">PU Scontato</th>
                                <th style="width: 120px; min-width: 120px;">Totale</th>
                                <th style="width: 50px; min-width: 50px;" class="row-actions-td"></th>
                            </tr>
                        </thead>
                        <tbody class="rep-items-tbody" data-rep-id="${rep.id}">
                            <!-- Voci del rapporto -->
                        </tbody>
                    </table>
                </div>
                <div class="add-row-btn-container">
                    <button class="btn btn-outline btn-primary add-rep-item-btn" data-rep-id="${rep.id}">
                        <i data-lucide="plus"></i> Aggiungi Voce
                    </button>
                </div>
            </div>
        `;
        
        repContainer.appendChild(repDiv);
        
        // Popola gli elementi
        const tbody = repDiv.querySelector('.rep-items-tbody');
        const items = rep.items || [];
        
        items.forEach((item, itemIdx) => {
            const tr = document.createElement('tr');
            const calcs = calculateItemRow(item.qty, item.price, markup, discount, item.maggiorata !== false);
            
            tr.innerHTML = `
                <td class="cell-center"><input type="checkbox" class="item-maggiorata" ${item.maggiorata !== false ? 'checked' : ''}></td>
                <td class="editable-cell"><input type="text" class="cell-input item-listino" value="${item.listino || 'NP'}"></td>
                <td class="editable-cell"><input type="text" class="cell-input item-voci cell-center" value="${item.voci || ''}"></td>
                <td class="editable-cell"><input type="text" class="cell-input item-desc" value="${item.descrizione || ''}"></td>
                <td class="editable-cell"><input type="text" class="cell-input item-um cell-center" value="${item.um || 'cad'}"></td>
                <td class="editable-cell"><input type="number" class="cell-input item-qty cell-right" value="${item.qty}" step="any"></td>
                <td class="editable-cell"><input type="number" class="cell-input item-price cell-right" value="${item.price}" step="any"></td>
                <td class="cell-right cell-readonly" data-calc="markup">${formatNumber(calcs.increment, 2)} €</td>
                <td class="cell-right cell-readonly" data-calc="discount">${formatNumber(calcs.discount, 2)} €</td>
                <td class="cell-right cell-readonly cell-bold" data-calc="scontato">${formatNumber(calcs.puScontato, 2)} €</td>
                <td class="cell-right cell-readonly cell-bold" data-calc="totale">${formatCurrency(calcs.total)}</td>
                <td class="row-actions-td">
                    <button class="row-action-btn delete-rep-item" data-rep-id="${rep.id}" data-item-id="${item.id}" title="Elimina Riga">
                        <i data-lucide="minus-circle"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        // Riga Totale per questo Rapporto
        const trTotal = document.createElement('tr');
        trTotal.className = 'excel-total-row';
        trTotal.innerHTML = `
            <td colspan="10" class="cell-bold" style="text-align: right;">Totale</td>
            <td class="cell-right cell-bold">${formatCurrency(repTotalVal)}</td>
            <td class="row-actions-td"></td>
        `;
        tbody.appendChild(trTotal);
    });
    
    lucide.createIcons();
    attachMonthSheetEventHandlers(monthObj);
}

function attachMonthSheetEventHandlers(monthObj) {
    const markup = activeConsObj.markupPercent;
    const discount = activeConsObj.discountPercent;
    
    // Toggle fisarmonica per i rapporti di lavoro
    document.querySelectorAll('.rapporto-header').forEach(header => {
        header.addEventListener('click', (e) => {
            // Evita collasso se clicchiamo su pulsanti d'azione
            if (e.target.closest('button') || e.target.closest('a')) return;
            
            const body = header.nextElementSibling;
            const icon = header.querySelector('.toggle-icon');
            if (body.style.display === 'none') {
                body.style.display = 'block';
                icon.style.transform = 'rotate(0deg)';
            } else {
                body.style.display = 'none';
                icon.style.transform = 'rotate(-90deg)';
            }
        });
    });
    
    // Modifica del numero/data del rapporto (modal)
    document.querySelectorAll('.edit-rep-meta-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const repId = e.currentTarget.getAttribute('data-id');
            const rep = monthObj.workReports.find(r => r.id === repId);
            if (rep) {
                openEditReportModal(monthObj, rep);
            }
        });
    });
    
    // Eliminazione Rapporto di Lavoro
    document.querySelectorAll('.delete-rep-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const repId = e.currentTarget.getAttribute('data-id');
            const rep = monthObj.workReports.find(r => r.id === repId);
            if (confirm(`Sei sicuro di voler eliminare l'intero Rapporto di Lavoro "${rep.reportId || ''}"?`)) {
                monthObj.workReports = monthObj.workReports.filter(r => r.id !== repId);
                saveState();
                renderActiveSheetContent();
            }
        });
    });
    
    // Aggiungi Rapporto di Lavoro
    document.getElementById('add-rapporto-btn').addEventListener('click', () => {
        openAddReportModal(monthObj);
    });
    
    // Aggiungi Voce all'interno di un Rapporto
    document.querySelectorAll('.add-rep-item-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const repId = e.currentTarget.getAttribute('data-rep-id');
            addReportItemRow(monthObj, repId);
        });
    });
    
    // Eliminazione Voce all'interno di un Rapporto
    document.querySelectorAll('.delete-rep-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const repId = e.currentTarget.getAttribute('data-rep-id');
            const itemId = e.currentTarget.getAttribute('data-item-id');
            const rep = monthObj.workReports.find(r => r.id === repId);
            if (rep) {
                rep.items = rep.items.filter(it => it.id !== itemId);
                saveState();
                renderActiveSheetContent();
            }
        });
    });
    
    // Modifica inline input celle
    document.querySelectorAll('.rep-items-tbody').forEach(tbody => {
        const repId = tbody.getAttribute('data-rep-id');
        const rep = monthObj.workReports.find(r => r.id === repId);
        if (!rep) return;
        
        tbody.querySelectorAll('tr').forEach((tr, index) => {
            if (tr.classList.contains('excel-total-row')) return;
            const itemObj = rep.items[index];
            if (!itemObj) return;
            
            const listinoInput = tr.querySelector('.item-listino');
            const vociInput = tr.querySelector('.item-voci');
            const descInput = tr.querySelector('.item-desc');
            const umInput = tr.querySelector('.item-um');
            const qtyInput = tr.querySelector('.item-qty');
            const priceInput = tr.querySelector('.item-price');
            const maggiorataCheckbox = tr.querySelector('.item-maggiorata');
            
            const handleInputChange = () => {
                itemObj.listino = listinoInput.value;
                itemObj.voci = vociInput.value;
                itemObj.descrizione = descInput.value;
                itemObj.um = umInput.value;
                itemObj.qty = Number(qtyInput.value) || 0;
                itemObj.price = Number(priceInput.value) || 0;
                itemObj.maggiorata = maggiorataCheckbox.checked;
                
                // Ricalcola in tempo reale la riga
                const calcs = calculateItemRow(itemObj.qty, itemObj.price, markup, discount, itemObj.maggiorata);
                tr.querySelector('[data-calc="markup"]').textContent = formatNumber(calcs.increment, 2) + ' €';
                tr.querySelector('[data-calc="discount"]').textContent = formatNumber(calcs.discount, 2) + ' €';
                tr.querySelector('[data-calc="scontato"]').textContent = formatNumber(calcs.puScontato, 2) + ' €';
                tr.querySelector('[data-calc="totale"]').textContent = formatCurrency(calcs.total);
                
                saveState();
                
                // Ricalcola totale del rapporto corrente
                const newRepTotal = rep.items.reduce((sum, it) => {
                    return sum + calculateItemRow(it.qty, it.price, markup, discount, it.maggiorata !== false).total;
                }, 0);
                
                tr.parentNode.querySelector('.excel-total-row td:last-child').textContent = formatCurrency(newRepTotal);
                
                // Aggiorna anche il totale mostrato nell'header del rapporto
                tbody.closest('.rapporto-section').querySelector('.rapporto-header span strong').textContent = formatCurrency(newRepTotal);
            };
            
            [listinoInput, vociInput, descInput, umInput, qtyInput, priceInput].forEach(inp => {
                inp.addEventListener('input', handleInputChange);
            });
            maggiorataCheckbox.addEventListener('change', handleInputChange);
        });
    });
}

function addReportItemRow(monthObj, repId) {
    const rep = monthObj.workReports.find(r => r.id === repId);
    if (!rep) return;
    
    const newItem = {
        id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        listino: 'NP',
        voci: '',
        descrizione: 'Nuova lavorazione...',
        um: 'cad',
        qty: 1,
        price: 0
    };
    
    if (!rep.items) rep.items = [];
    rep.items.push(newItem);
    saveState();
    renderActiveSheetContent();
}

// --- VISTA 6: IMPOSTAZIONI ---
function renderSettings() {
    document.getElementById('set-company-name').value = state.settings.companyName || '';
    document.getElementById('set-company-logo').value = state.settings.companyLogo || 'rekeep';
    document.getElementById('set-ca-person').value = state.settings.caPerson || '';
    document.getElementById('set-ca-person2').value = state.settings.caPerson2 || '';
    document.getElementById('set-markup').value = state.settings.defaultMarkup;
    document.getElementById('set-discount').value = state.settings.defaultDiscount;
    document.getElementById('set-formula').value = state.settings.defaultFormulaType || 'corretta';
}

function saveSettingsFromUI() {
    state.settings.companyName = document.getElementById('set-company-name').value;
    state.settings.companyLogo = document.getElementById('set-company-logo').value || 'rekeep';
    state.settings.caPerson = document.getElementById('set-ca-person').value;
    state.settings.caPerson2 = document.getElementById('set-ca-person2').value;
    state.settings.defaultMarkup = Number(document.getElementById('set-markup').value) || 0;
    state.settings.defaultDiscount = Number(document.getElementById('set-discount').value) || 0;
    state.settings.defaultFormulaType = document.getElementById('set-formula').value || 'corretta';
    
    saveState();
    alert('Impostazioni salvate con successo!');
    switchView('dashboard');
}

// --- BACKUP E RIPRISTINO DATI ---

function showBackupStatus(message, isError = false) {
    const ids = ['backup-status-msg', 'backup-status-msg-home'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = message;
            el.style.display = 'inline-block';
            el.style.color = isError ? '#ef4444' : '#22c55e';
            setTimeout(() => { el.style.display = 'none'; }, 5000);
        }
    });
}

async function exportBackup() {
    try {
        const backupData = {
            _backupMeta: {
                version: '1.2',
                app: 'Gestione Preventivi e Consuntivi',
                createdAt: new Date().toISOString(),
                totalPreventivi: state.preventivi.length,
                totalConsuntivi: state.consuntivi.length,
                totalOreExtra: state.oreExtra.length,
                totalRapporti: (state.rapporti || []).length
            },
            preventivi: state.preventivi,
            consuntivi: state.consuntivi,
            oreExtra: state.oreExtra,
            rapporti: state.rapporti || [],
            settings: state.settings
        };

        const jsonStr = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const dateStr = new Date().toISOString().slice(0, 10);
        const timeStr = new Date().toTimeString().slice(0, 5).replace(':', '');
        const fileName = `backup_preventivi_consuntivi_${dateStr}_${timeStr}.json`;

        // Se supportato dal browser, usa il File System Access API per scegliere il percorso
        if ('showSaveFilePicker' in window) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: fileName,
                    types: [{
                        description: 'File di Backup JSON',
                        accept: {
                            'application/json': ['.json'],
                        },
                    }],
                });
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
                showBackupStatus(`✅ Backup salvato con successo come: ${handle.name}`);
            } catch (err) {
                // Se l'utente annulla il salvataggio
                if (err.name === 'AbortError') {
                    showBackupStatus('Esportazione backup annullata.');
                } else {
                    console.error('Errore durante showSaveFilePicker:', err);
                    throw err;
                }
            }
        } else {
            // Fallback per browser che non supportano l'API (come Firefox)
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showBackupStatus(`✅ Backup scaricato con successo: ${fileName}`);
        }
    } catch (e) {
        console.error('Errore durante l\'esportazione del backup:', e);
        showBackupStatus('❌ Errore durante l\'esportazione del backup.', true);
    }
}

function importBackup(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            // Rimuovi eventuale BOM UTF-8 presente nei file Windows
            let rawText = e.target.result;
            if (rawText.charCodeAt(0) === 0xFEFF) {
                rawText = rawText.substring(1);
            }
            rawText = rawText.trim();

            console.log('Backup import: primi 200 caratteri del file:', rawText.substring(0, 200));

            const data = JSON.parse(rawText);

            // Validazione flessibile: accetta sia il formato backup completo
            // che un semplice export dello stato
            let preventivi = data.preventivi || [];
            let consuntivi = data.consuntivi || [];
            let oreExtra = data.oreExtra || [];
            let rapporti = data.rapporti || [];
            let settings = data.settings || null;

            // Se il file è un vecchio stato salvato direttamente (ha le chiavi al primo livello)
            if (!Array.isArray(preventivi)) {
                preventivi = [];
            }
            if (!Array.isArray(consuntivi)) {
                consuntivi = [];
            }

            // Verifica che ci sia almeno qualche dato utile
            if (preventivi.length === 0 && consuntivi.length === 0 && oreExtra.length === 0 && rapporti.length === 0 && !settings) {
                showBackupStatus('❌ Il file non contiene dati di preventivi, consuntivi, ore extra, rapporti o impostazioni riconoscibili.', true);
                console.warn('Backup import: struttura dati non riconosciuta. Chiavi trovate:', Object.keys(data));
                return;
            }

            // Mostra riepilogo e chiedi conferma
            const meta = data._backupMeta || {};
            const createdAt = meta.createdAt ? new Date(meta.createdAt).toLocaleString('it-IT') : 'sconosciuta';
            const msg = `Stai per ripristinare un backup contenente:\n\n` +
                `🔹 ${preventivi.length} preventivi\n` +
                `🔹 ${consuntivi.length} consuntivi\n` +
                `🔹 ${oreExtra.length} registri ore extra\n` +
                `🔹 ${rapporti.length} rapporti di lavoro\n` +
                `🔹 Data creazione backup: ${createdAt}\n\n` +
                `⚠️ ATTENZIONE: Tutti i dati attuali verranno sostituiti.\n\nConfermi il ripristino?`;

            if (!confirm(msg)) {
                showBackupStatus('Ripristino annullato.');
                return;
            }

            // Applica il ripristino
            state.preventivi = preventivi;
            state.consuntivi = consuntivi;
            state.oreExtra = oreExtra;
            state.rapporti = rapporti;
            if (settings) {
                state.settings = Object.assign(state.settings, settings);
            }

            saveState();

            // Applica tema ripristinato
            document.documentElement.setAttribute('data-theme', state.settings.theme || 'dark');

            // Aggiorna UI
            updateDashboardStats();
            renderSettings();

            showBackupStatus(`✅ Backup ripristinato con successo! (${preventivi.length} preventivi, ${consuntivi.length} consuntivi, ${oreExtra.length} ore extra, ${rapporti.length} rapporti)`);

            // Ricarica la vista corrente
            const currentView = state.activeView || 'settings';
            switchView(currentView);

        } catch (parseError) {
            console.error('Errore nel parsing del file di backup:', parseError);
            console.error('Dettaglio errore:', parseError.message);
            showBackupStatus(`❌ Errore nel file: ${parseError.message}`, true);
        }
    };

    reader.onerror = () => {
        showBackupStatus('❌ Errore nella lettura del file.', true);
    };

    reader.readAsText(file, 'UTF-8');
}

// --- CONTROLLO MODALI E POPUP ---

// 1. Modale Aggiungi Preventivo
function openAddPreventivoModal() {
    const modal = document.getElementById('modal-add-preventivo');
    modal.classList.add('active');
    
    // Suggerisce un nuovo numero progressivo
    document.getElementById('add-prev-number').value = String(state.preventivi.length + 1).padStart(5, '0');
    document.getElementById('add-prev-subject').value = '';
    
    renderCommessaSelector(); // Aggiorna le select commesse nelle modali
    const commessaSelect = document.getElementById('add-prev-commessa');
    const clientSelect = document.getElementById('add-prev-client');
    
    if (state.activeCommessaId !== 'all') {
        commessaSelect.value = state.activeCommessaId;
        commessaSelect.disabled = true;
        const comm = state.commesse.find(c => c.id === state.activeCommessaId);
        if (comm && clientSelect) {
            clientSelect.value = comm.committenteDefault || 'RAI';
        }
    } else {
        commessaSelect.disabled = false;
        if (state.commesse.length > 0) {
            commessaSelect.selectedIndex = 0;
            const comm = state.commesse[0];
            if (clientSelect) {
                clientSelect.value = comm.committenteDefault || 'RAI';
            }
        }
    }
}

function closeAddPreventivoModal() {
    document.getElementById('modal-add-preventivo').classList.remove('active');
}

function submitAddPreventivo() {
    const num = document.getElementById('add-prev-number').value;
    const commessaId = document.getElementById('add-prev-commessa').value;
    const client = document.getElementById('add-prev-client').value;
    const subject = document.getElementById('add-prev-subject').value;
    
    if (!num || !subject || !commessaId) {
        alert('Compilare tutti i campi obbligatori.');
        return;
    }
    
    const newId = 'prev-' + Date.now();
    const newPrev = {
        id: newId,
        commessaId: commessaId,
        number: num,
        date: new Date().toISOString().split('T')[0],
        committente: client,
        presidio: `${client} MILANO`,
        areaLavoro: '',
        areaIntervento: 'C.so Sempione 27 (MI)',
        odl: '',
        prevCode: 'REK/' + new Date().getFullYear() + '/U/ic/' + String(state.preventivi.length + 100).padStart(6, '0'),
        oggetto: `${client} Milano - Preventivo per ${subject}`,
        companyName: state.settings.companyName,
        caPerson: state.settings.caPerson,
        caPerson2: state.settings.caPerson2,
        markupPercent: state.settings.defaultMarkup,
        discountPercent: state.settings.defaultDiscount,
        status: 'draft',
        author: 'Ivan Luca Campagnoli',
        notes: '',
        conditions: {
            pagamenti: 'Termini contrattuali',
            esclusione: 'Tutto quanto non descritto',
            validita: '30 giorni',
            consegna: '30 giorni data ordine'
        },
        items: []
    };
    
    state.preventivi.push(newPrev);
    saveState();
    closeAddPreventivoModal();
    switchView('preventivi-edit', newId);
}

// 2. Modale Aggiungi Consuntivo
function openAddConsuntivoModal() {
    const modal = document.getElementById('modal-add-consuntivo');
    modal.classList.add('active');
    document.getElementById('add-cons-name').value = `CONSUNTIVO EXTRA CANONE ${new Date().getFullYear()}`;
    
    renderCommessaSelector(); // Aggiorna le select commesse nelle modali
    const commessaSelect = document.getElementById('add-cons-commessa');
    const clientSelect = document.getElementById('add-cons-client');
    
    if (state.activeCommessaId !== 'all') {
        commessaSelect.value = state.activeCommessaId;
        commessaSelect.disabled = true;
        const comm = state.commesse.find(c => c.id === state.activeCommessaId);
        if (comm && clientSelect) {
            clientSelect.value = comm.committenteDefault || 'RAI';
        }
    } else {
        commessaSelect.disabled = false;
        if (state.commesse.length > 0) {
            commessaSelect.selectedIndex = 0;
            const comm = state.commesse[0];
            if (clientSelect) {
                clientSelect.value = comm.committenteDefault || 'RAI';
            }
        }
    }
}

function closeAddConsuntivoModal() {
    document.getElementById('modal-add-consuntivo').classList.remove('active');
}

function submitAddConsuntivo() {
    const name = document.getElementById('add-cons-name').value;
    const commessaId = document.getElementById('add-cons-commessa').value;
    const client = document.getElementById('add-cons-client').value;
    
    if (!name || !commessaId) {
        alert('Inserire tutti i campi obbligatori.');
        return;
    }
    
    const newId = 'cons-' + Date.now();
    const newCons = {
        id: newId,
        commessaId: commessaId,
        name: name,
        committente: client,
        presidio: `${client} MILANO`,
        areaIntervento: 'C.so Sempione 27 (MI)',
        odl: '',
        date: new Date().toISOString().split('T')[0],
        companyName: state.settings.companyName,
        caPerson: state.settings.caPerson,
        caPerson2: state.settings.caPerson2,
        markupPercent: state.settings.defaultMarkup,
        discountPercent: state.settings.defaultDiscount,
        oggetto: `OGGETTO: RIEPILOGO CONSUNTIVI LAVORAZIONI EXTRA CANONE APRILE-MAGGIO-GIUGNO ${new Date().getFullYear()}`,
        extraCanoneText: 'MANUTENZIONE  EXTRA CANONE',
        status: 'draft',
        months: []
    };
    
    state.consuntivi.push(newCons);
    saveState();
    closeAddConsuntivoModal();
    switchView('consuntivi-edit', newId);
}

// 3. Modale Aggiungi Scheda Mese Consuntivo
function openAddMonthModal() {
    const modal = document.getElementById('modal-add-month');
    modal.classList.add('active');
    document.getElementById('add-month-name').value = '';
}

function closeAddMonthModal() {
    document.getElementById('modal-add-month').classList.remove('active');
}

function submitAddMonth() {
    const name = document.getElementById('add-month-name').value.trim();
    if (!name) {
        alert('Inserire un nome per la scheda del mese.');
        return;
    }
    
    const monthId = 'month-' + Date.now();
    const newMonth = {
        id: monthId,
        monthName: name.toUpperCase(),
        workReports: []
    };
    
    if (!activeConsObj.months) activeConsObj.months = [];
    activeConsObj.months.push(newMonth);
    saveState();
    closeAddMonthModal();
    
    // Imposta la nuova scheda come attiva
    state.activeSheetTab = monthId;
    renderSheetTabs();
}

// 4. Modale Gestione Rapporto di Lavoro (Aggiungi/Modifica)
let reportModalContext = {
    monthObj: null,
    repObj: null // se null, siamo in add mode
};

function openAddReportModal(monthObj) {
    reportModalContext = { monthObj, repObj: null };
    const modal = document.getElementById('modal-report-details');
    modal.querySelector('h3').textContent = 'Aggiungi Rapporto di Lavoro';
    document.getElementById('rep-modal-num').value = '';
    document.getElementById('rep-modal-date').value = '';
    document.getElementById('rep-modal-bilancino').value = '';
    document.getElementById('rep-modal-rds-code').value = '';
    document.getElementById('rep-modal-rdf-code').value = '';
    modal.classList.add('active');
}

function openEditReportModal(monthObj, repObj) {
    reportModalContext = { monthObj, repObj };
    const modal = document.getElementById('modal-report-details');
    modal.querySelector('h3').textContent = 'Modifica Dettagli Rapporto';
    document.getElementById('rep-modal-num').value = repObj.reportId || '';
    document.getElementById('rep-modal-date').value = repObj.dateText || '';
    document.getElementById('rep-modal-bilancino').value = repObj.bilancino || '';
    document.getElementById('rep-modal-rds-code').value = repObj.rdsCode || '';
    document.getElementById('rep-modal-rdf-code').value = repObj.rdfCode || '';
    modal.classList.add('active');
}

function closeReportModal() {
    document.getElementById('modal-report-details').classList.remove('active');
}

function submitReportDetails() {
    const num = document.getElementById('rep-modal-num').value;
    const dateText = document.getElementById('rep-modal-date').value;
    const bilancinoVal = document.getElementById('rep-modal-bilancino').value;
    const rdsCodeVal = document.getElementById('rep-modal-rds-code').value;
    const rdfCodeVal = document.getElementById('rep-modal-rdf-code').value;
    
    if (!num) {
        alert('Inserire il numero del rapporto.');
        return;
    }
    
    const { monthObj, repObj } = reportModalContext;
    
    if (repObj) {
        // Edit mode
        repObj.reportId = num;
        repObj.dateText = dateText;
        repObj.bilancino = bilancinoVal;
        repObj.rdsCode = rdsCodeVal;
        repObj.rdfCode = rdfCodeVal;
    } else {
        // Add mode
        const newRep = {
            id: 'rep-' + Date.now(),
            reportId: num,
            dateText: dateText,
            bilancino: bilancinoVal,
            rdsCode: rdsCodeVal,
            rdfCode: rdfCodeVal,
            items: []
        };
        monthObj.workReports.push(newRep);
    }
    
    saveState();
    closeReportModal();
    renderActiveSheetContent();
}

// --- VISTA 7: LISTA ORE EXTRA ---
let activeOreObj = null;

function renderOreExtraList() {
    const tbody = document.getElementById('oreExtra-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const searchVal = document.getElementById('search-oreExtra')?.value.toLowerCase() || '';
    const statusVal = document.getElementById('filter-oreExtra-status')?.value || 'all';
    
    const filtered = state.oreExtra.filter(oe => {
        const matchCommessa = state.activeCommessaId === 'all' || oe.commessaId === state.activeCommessaId;
        const matchSearch = (oe.name || '').toLowerCase().includes(searchVal) || 
                            (oe.committente || '').toLowerCase().includes(searchVal) ||
                            (oe.presidio || '').toLowerCase().includes(searchVal);
        const matchStatus = statusVal === 'all' || (oe.status || 'draft') === statusVal;
        return matchCommessa && matchSearch && matchStatus;
    });

    filtered.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'it', { sensitivity: 'base' }));

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--text-muted);">Nessun registro ore extra trovato</td></tr>`;
        return;
    }
    
    filtered.forEach(oe => {
        const tr = document.createElement('tr');
        const total = getOreExtraTotal(oe);
        
        let totalHours = 0;
        if (oe.months && oe.months.length > 0) {
            oe.months.forEach(m => {
                const part1Hours = (m.part1 || []).reduce((sum, item) => sum + (item.oreGg || 0) * (item.giorni || 0), 0);
                const part2Hours = (m.part2 || []).reduce((sum, day) => sum + (day.hours || 0), 0);
                totalHours += (part1Hours + part2Hours);
            });
        }
        
        let statusBadge = '';
        const status = oe.status || 'draft';
        if (status === 'draft') statusBadge = '<span class="badge badge-draft">Bozza</span>';
        else if (status === 'sent') statusBadge = '<span class="badge badge-sent">Inviato</span>';
        else if (status === 'approved') statusBadge = '<span class="badge badge-approved">Approvato</span>';
        else if (status === 'rejected') statusBadge = '<span class="badge badge-rejected">Respinto</span>';
        
        let bilancinoBadge = '<span class="badge badge-draft">---</span>';
        if (oe.bilancino === 'OK') bilancinoBadge = '<span class="badge badge-approved">OK</span>';
        else if (oe.bilancino === 'NO') bilancinoBadge = '<span class="badge badge-rejected">da inserire</span>';
        
        // Calcola lo stato RDS/RDF in base ai codici mensili
        let hasMonths = false;
        let allMonthsFilled = true;
        if (oe.months && oe.months.length > 0) {
            oe.months.forEach(m => {
                hasMonths = true;
                if (!m.rdsCode || !m.rdsCode.trim() || !m.rdfCode || !m.rdfCode.trim()) {
                    allMonthsFilled = false;
                }
            });
        }
        
        let rdsRdfContent = '<span class="badge badge-draft">---</span>';
        if (hasMonths) {
            if (allMonthsFilled) {
                rdsRdfContent = '<span class="badge badge-approved">OK</span>';
            } else {
                rdsRdfContent = '<span class="badge badge-rejected">da inserire</span>';
            }
        }
        
        tr.innerHTML = `
            <td><strong>${oe.name || '---'}</strong></td>
            <td>${oe.date || '---'}</td>
            <td>${oe.committente || '---'}</td>
            <td>${oe.presidio || '---'}</td>
            <td><strong>${totalHours.toLocaleString('it-IT', { minimumFractionDigits: 1 })} ore</strong></td>
            <td><strong>${formatCurrency(total)}</strong></td>
            <td>${bilancinoBadge}</td>
            <td>${rdsRdfContent}</td>
            <td>${statusBadge}</td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-outline btn-icon-only edit-ore-btn" data-id="${oe.id}" title="Modifica">
                        <i data-lucide="edit"></i>
                    </button>
                    <button class="btn btn-outline btn-icon-only excel-ore-btn" data-id="${oe.id}" title="Esporta Excel" style="color: #22c55e;">
                        <i data-lucide="file-spreadsheet"></i>
                    </button>
                    <button class="btn btn-outline btn-icon-only pdf-ore-btn" data-id="${oe.id}" title="Esporta PDF" style="color: #ef4444;">
                        <i data-lucide="file-text"></i>
                    </button>
                    <button class="btn btn-outline btn-icon-only delete-ore-btn" data-id="${oe.id}" title="Elimina" style="color: var(--danger);">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    lucide.createIcons();
    attachOreListEventHandlers();
}

function attachOreListEventHandlers() {
    document.querySelectorAll('.edit-ore-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            switchView('oreExtra-edit', id);
        });
    });
    
    document.querySelectorAll('.excel-ore-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const oe = state.oreExtra.find(o => o.id === id);
            if (oe) {
                btn.disabled = true;
                await ExcelExporter.exportOreExtra(oe);
                btn.disabled = false;
            }
        });
    });
    
    document.querySelectorAll('.pdf-ore-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const oe = state.oreExtra.find(o => o.id === id);
            if (oe) {
                switchView('oreExtra-edit', id);
                setTimeout(() => {
                    PDFExporter.showOreExtraPreview(oe);
                }, 200);
            }
        });
    });
    
    document.querySelectorAll('.delete-ore-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const oe = state.oreExtra.find(o => o.id === id);
            if (confirm(`Sei sicuro di voler eliminare il registro ore extra "${oe.name || ''}"?`)) {
                state.oreExtra = state.oreExtra.filter(o => o.id !== id);
                saveState();
                renderOreExtraList();
            }
        });
    });
}

// --- VISTA 8: EDITOR ORE EXTRA ---
function renderOreExtraEditor() {
    activeOreObj = state.oreExtra.find(o => o.id === state.editingId);
    if (!activeOreObj) {
        activeOreObj = {
            id: 'ore-' + Date.now(),
            name: `ORE EXTRA 3Q2026`,
            committente: 'RAI',
            presidio: 'RAI MILANO SEMPIONE',
            areaIntervento: 'C.so Sempione 27 (MI)',
            odl: '',
            prevCode: '',
            date: new Date().toISOString().split('T')[0],
            companyName: 'DIREZIONE OPERATION - AREA LOMBARDIA',
            caPerson: state.settings.caPerson,
            caPerson2: state.settings.caPerson2,
            costoBase: 18.30,
            markupPercent: 26.50,
            discountPercent: 31.00,
            formulaType: 'originale',
            status: 'draft',
            months: [
                {
                    id: 'ore-month-luglio-' + Date.now(),
                    monthName: 'LUG 2026 consuntivo',
                    part1: [
                        { key: 'feriale_diurno', description: 'ORE FERIALI DIURNE AD INTEGRAZIONE (06:00-08:30)', oreGg: 2.5, giorni: 0, maggiorazione: 0 },
                        { key: 'feriale_notturno', description: 'Sovrapprezzo per lavoro notturno - ORE NOTTURNE FERIALI(00:30-06:00)', oreGg: 5.5, giorni: 0, maggiorazione: 0.3 },
                        { key: 'festivo', description: 'Sovrapprezzo per lavoro festivo - ORE FESTIVE', oreGg: 8.0, giorni: 0, maggiorazione: 0.5 }
                    ],
                    part2: []
                },
                {
                    id: 'ore-month-agosto-' + Date.now(),
                    monthName: 'AGO 2026 consuntivo',
                    part1: [
                        { key: 'feriale_diurno', description: 'ORE FERIALI DIURNE AD INTEGRAZIONE (06:00-08:30)', oreGg: 2.5, giorni: 0, maggiorazione: 0 },
                        { key: 'feriale_notturno', description: 'Sovrapprezzo per lavoro notturno - ORE NOTTURNE FERIALI(00:30-06:00)', oreGg: 5.5, giorni: 0, maggiorazione: 0.3 },
                        { key: 'festivo', description: 'Sovrapprezzo per lavoro festivo - ORE FESTIVE', oreGg: 8.0, giorni: 0, maggiorazione: 0.5 }
                    ],
                    part2: []
                },
                {
                    id: 'ore-month-settembre-' + Date.now(),
                    monthName: 'SET 2026 consuntivo',
                    part1: [
                        { key: 'feriale_diurno', description: 'ORE FERIALI DIURNE AD INTEGRAZIONE (06:00-08:30)', oreGg: 2.5, giorni: 0, maggiorazione: 0 },
                        { key: 'feriale_notturno', description: 'Sovrapprezzo per lavoro notturno - ORE NOTTURNE FERIALI(00:30-06:00)', oreGg: 5.5, giorni: 0, maggiorazione: 0.3 },
                        { key: 'festivo', description: 'Sovrapprezzo per lavoro festivo - ORE FESTIVE', oreGg: 8.0, giorni: 0, maggiorazione: 0.5 }
                    ],
                    part2: []
                }
            ]
        };
        state.oreExtra.push(activeOreObj);
        saveState();
    }
    
    // Popola metadati
    document.getElementById('ore-meta-company').value = activeOreObj.companyName || '';
    document.getElementById('ore-meta-ca').value = activeOreObj.caPerson || '';
    document.getElementById('ore-meta-ca2').value = activeOreObj.caPerson2 || '';
    document.getElementById('ore-meta-date').value = activeOreObj.date || '';
    document.getElementById('ore-meta-committente').value = activeOreObj.committente || '';
    document.getElementById('ore-meta-presidio').value = activeOreObj.presidio || '';
    document.getElementById('ore-meta-odl').value = activeOreObj.odl || '';
    document.getElementById('ore-meta-prevcode').value = activeOreObj.prevCode || '';
    document.getElementById('ore-meta-intervento').value = activeOreObj.areaIntervento || '';
    document.getElementById('ore-meta-name').value = activeOreObj.name || '';
    document.getElementById('ore-edit-status').value = activeOreObj.status || 'draft';
    document.getElementById('ore-edit-bilancino').value = activeOreObj.bilancino || '';
    
    document.getElementById('ore-edit-costobase').value = activeOreObj.costoBase || 18.30;
    document.getElementById('ore-edit-markup').value = activeOreObj.markupPercent || 0;
    document.getElementById('ore-edit-discount').value = activeOreObj.discountPercent || 0;
    document.getElementById('ore-edit-formula').value = activeOreObj.formulaType || 'originale';
    
    renderOreExtraTabs();
}

function renderOreExtraTabs() {
    const tabsContainer = document.getElementById('ore-tabs-container');
    if (!tabsContainer) return;
    tabsContainer.innerHTML = '';
    
    // 1. Tab Riepilogo
    const tabRiepilogo = document.createElement('div');
    tabRiepilogo.className = `sheet-tab ${state.activeSheetTab === 'riepilogo' ? 'active' : ''}`;
    tabRiepilogo.innerHTML = `<i data-lucide="file-bar-chart-2"></i> Riepilogo`;
    tabRiepilogo.addEventListener('click', () => {
        state.activeSheetTab = 'riepilogo';
        renderOreExtraTabs();
    });
    tabsContainer.appendChild(tabRiepilogo);
    
    // 2. Tab Mesi
    (activeOreObj.months || []).forEach(m => {
        const tabMonth = document.createElement('div');
        tabMonth.className = `sheet-tab ${state.activeSheetTab === m.id ? 'active' : ''}`;
        tabMonth.innerHTML = `<i data-lucide="calendar"></i> ${expandOreMonthName(m.monthName).split(' ')[0]}`;
        tabMonth.addEventListener('click', () => {
            state.activeSheetTab = m.id;
            renderOreExtraTabs();
        });
        tabsContainer.appendChild(tabMonth);
    });
    
    lucide.createIcons();
    renderActiveOreExtraSheetContent();
}

function renderActiveOreExtraSheetContent() {
    const sheetBody = document.getElementById('ore-sheet-body');
    if (!sheetBody) return;
    sheetBody.innerHTML = '';
    
    if (state.activeSheetTab === 'riepilogo') {
        renderOreExtraRiepilogoSheet(sheetBody);
    } else {
        renderOreExtraMonthSheet(sheetBody, state.activeSheetTab);
    }
    if (window.lucide) window.lucide.createIcons();
}

function renderOreExtraRiepilogoSheet(container) {
    const tableCard = document.createElement('div');
    tableCard.className = 'table-card excel-theme';
    
    let rowsHtml = '';
    let grandTotal = 0;
    let grandTotalHours = 0;
    
    (activeOreObj.months || []).forEach(m => {
        const monthTotal = getOreExtraMonthTotal(activeOreObj, m);
        grandTotal += monthTotal;
        
        const part1Hours = (m.part1 || []).reduce((sum, item) => sum + (item.oreGg || 0) * (item.giorni || 0), 0);
        const part2Hours = (m.part2 || []).reduce((sum, day) => sum + (day.hours || 0), 0);
        const monthHours = part1Hours + part2Hours;
        grandTotalHours += monthHours;
        
        const rdsBadge = m.rdsCode && m.rdsCode.trim()
            ? `<span style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; padding: 2px 8px; border-radius: 6px; font-size: 0.8rem; font-weight: 600;">${m.rdsCode}</span>`
            : '<span style="color: var(--text-muted);">---</span>';
        const rdfBadge = m.rdfCode && m.rdfCode.trim()
            ? `<span style="background: rgba(168, 85, 247, 0.15); color: #a855f7; padding: 2px 8px; border-radius: 6px; font-size: 0.8rem; font-weight: 600;">${m.rdfCode}</span>`
            : '<span style="color: var(--text-muted);">---</span>';
        
        rowsHtml += `
            <tr>
                <td class="cell-bold">${expandOreMonthName(m.monthName).toUpperCase()}</td>
                <td class="cell-center">${rdsBadge}</td>
                <td class="cell-center">${rdfBadge}</td>
                <td class="cell-center cell-bold">${monthHours.toLocaleString('it-IT', { minimumFractionDigits: 1 })} ore</td>
                <td class="cell-right">${formatCurrency(monthTotal)}</td>
            </tr>
        `;
    });
    
    tableCard.innerHTML = `
        <div class="table-header-title">OGGETTO: RIEPILOGO CONSUNTIVO ORE EXTRA</div>
        <table class="excel-table">
            <thead>
                <tr>
                    <th>MESE / RIFERIMENTO</th>
                    <th style="text-align: center; width: 160px;">CODICE RDS</th>
                    <th style="text-align: center; width: 160px;">CODICE RDF</th>
                    <th style="text-align: center; width: 140px;">ORE TOTALI</th>
                    <th style="text-align: right; width: 250px;">IMPORTO ORE EXTRA (IVA ESCL.)</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
                <tr class="excel-total-row">
                    <td class="cell-bold" colspan="3">TOTALE GENERALE</td>
                    <td class="cell-center cell-bold">${grandTotalHours.toLocaleString('it-IT', { minimumFractionDigits: 1 })} ore</td>
                    <td class="cell-right cell-bold">${formatCurrency(grandTotal)}</td>
                </tr>
            </tbody>
        </table>
    `;
    container.appendChild(tableCard);
}

const ITALIAN_WEEKDAYS = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];

function getMonthAndYearFromMonthName(monthName) {
    const parts = monthName.split(' ');
    const mStr = parts[0].toUpperCase();
    const year = parseInt(parts[1]) || 2026;
    let monthIndex = 0;
    if (mStr.startsWith('GEN')) monthIndex = 0;
    else if (mStr.startsWith('FEB')) monthIndex = 1;
    else if (mStr.startsWith('MAR')) monthIndex = 2;
    else if (mStr.startsWith('APR')) monthIndex = 3;
    else if (mStr.startsWith('MAG') || mStr.startsWith('MAY')) monthIndex = 4;
    else if (mStr.startsWith('GIU') || mStr.startsWith('JUN')) monthIndex = 5;
    else if (mStr.startsWith('LUG') || mStr.startsWith('JUL')) monthIndex = 6;
    else if (mStr.startsWith('AGO') || mStr.startsWith('AUG')) monthIndex = 7;
    else if (mStr.startsWith('SET') || mStr.startsWith('SEP')) monthIndex = 8;
    else if (mStr.startsWith('OTT') || mStr.startsWith('OCT')) monthIndex = 9;
    else if (mStr.startsWith('NOV')) monthIndex = 10;
    else if (mStr.startsWith('DIC') || mStr.startsWith('DEC')) monthIndex = 11;
    return { monthIndex, year };
}

/**
 * Espande l'abbreviazione del mese al nome completo italiano e rimuove 'consuntivo'.
 * Es. "LUG 2026 consuntivo" → "LUGLIO 2026"
 */
function expandOreMonthName(monthName) {
    const MONTH_FULL = {
        'GEN': 'GENNAIO', 'FEB': 'FEBBRAIO', 'MAR': 'MARZO', 'APR': 'APRILE',
        'MAG': 'MAGGIO', 'GIU': 'GIUGNO', 'LUG': 'LUGLIO', 'AGO': 'AGOSTO',
        'SET': 'SETTEMBRE', 'OTT': 'OTTOBRE', 'NOV': 'NOVEMBRE', 'DIC': 'DICEMBRE'
    };
    const clean = monthName.replace(/\s*consuntivo\s*/i, '').trim();
    const parts = clean.split(' ');
    const abbr = parts[0].toUpperCase().substring(0, 3);
    const fullMonth = MONTH_FULL[abbr] || parts[0].toUpperCase();
    const rest = parts.slice(1).join(' ');
    return (fullMonth + (rest ? ' ' + rest : '')).trim();
}

function renderOreExtraMonthSheet(container, monthId) {
    const month = activeOreObj.months.find(m => m.id === monthId);
    if (!month) return;
    
    const base = activeOreObj.costoBase || 18.3;
    const markup = activeOreObj.markupPercent || 0;
    const discount = activeOreObj.discountPercent || 0;
    
    // Calcola i giorni mancanti
    const { monthIndex, year } = getMonthAndYearFromMonthName(month.monthName);
    const allDays = generatePart2Days(year, monthIndex);
    const missingDays = allDays.filter(ad => !month.part2.some(p2 => p2.date === ad.date));
    
    // --- PANNELLO CODICI RDS/RDF MENSILE ---
    const rdsRdfCard = document.createElement('div');
    rdsRdfCard.className = 'table-card excel-theme';
    rdsRdfCard.style.marginBottom = '24px';
    rdsRdfCard.innerHTML = `
        <div class="table-header-title" style="display: flex; justify-content: space-between; align-items: center;">
            <span>CODICI RDS / RDF — ${expandOreMonthName(month.monthName).toUpperCase()}</span>
        </div>
        <div style="display: flex; gap: 24px; padding: 16px; flex-wrap: wrap; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <label style="font-weight: 600; font-size: 0.85rem; color: #3b82f6;">Codice RDS:</label>
                <input type="text" class="ore-month-rds-input form-control-cell" value="${month.rdsCode || ''}" placeholder="es. RDS-12345" style="width: 180px; padding: 6px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15); background: rgba(0,0,0,0.15); color: inherit; font-size: 0.9rem;">
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <label style="font-weight: 600; font-size: 0.85rem; color: #a855f7;">Codice RDF:</label>
                <input type="text" class="ore-month-rdf-input form-control-cell" value="${month.rdfCode || ''}" placeholder="es. RDF-12345" style="width: 180px; padding: 6px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15); background: rgba(0,0,0,0.15); color: inherit; font-size: 0.9rem;">
            </div>
        </div>
    `;
    container.appendChild(rdsRdfCard);
    
    // Event listener per auto-save dei codici mensili
    rdsRdfCard.querySelector('.ore-month-rds-input').addEventListener('change', (e) => {
        month.rdsCode = e.target.value.trim();
        saveState();
    });
    rdsRdfCard.querySelector('.ore-month-rdf-input').addEventListener('change', (e) => {
        month.rdfCode = e.target.value.trim();
        saveState();
    });
    
    // --- PARTE 1 ---
    const part1Card = document.createElement('div');
    part1Card.className = 'table-card excel-theme';
    part1Card.style.marginBottom = '32px';
    
    let part1Rows = '';
    let part1Total = 0;
    let part1TotalHours = 0;
    
    (month.part1 || []).forEach((item, index) => {
        const tariffa = calculateOreExtraTariff(base, markup, discount, item.maggiorazione);
        const totHours = (item.oreGg || 0) * (item.giorni || 0);
        const totImporto = totHours * tariffa;
        part1Total += totImporto;
        part1TotalHours += totHours;
        
        part1Rows += `
            <tr>
                <td>${item.description}</td>
                <td class="cell-center"><input type="number" class="p1-ore-input form-control-cell" data-idx="${index}" value="${item.oreGg}" step="0.1" style="width: 70px; text-align: center;"></td>
                <td class="cell-center"><input type="number" class="p1-gg-input form-control-cell" data-idx="${index}" value="${item.giorni}" min="0" max="31" style="width: 70px; text-align: center;"></td>
                <td class="cell-right">${formatCurrency(tariffa)}</td>
                <td class="cell-right cell-bold">${formatCurrency(totImporto)}</td>
            </tr>
        `;
    });
    
    part1Card.innerHTML = `
        <div class="table-header-title">PARTE 1: INTEGRAZIONE SERVIZIO ESERCIZIO H24 (PRESIDIO CORPO DI GUARDIA)</div>
        <table class="excel-table">
            <thead>
                <tr>
                    <th>DESCRIZIONE DEL SERVIZIO E TEMPISTICA</th>
                    <th style="width: 100px; text-align: center;">ORE GG</th>
                    <th style="width: 100px; text-align: center;">N° GIORNI</th>
                    <th style="width: 150px; text-align: right;">TARIFFA ORARIA (€)</th>
                    <th style="width: 180px; text-align: right;">IMPORTO TOTALE (€)</th>
                </tr>
            </thead>
            <tbody>
                ${part1Rows}
                <tr class="excel-total-row">
                    <td colspan="2" class="cell-bold">TOTALE PARTE 1</td>
                    <td class="cell-center cell-bold">${part1TotalHours.toLocaleString('it-IT', { minimumFractionDigits: 1 })} ore</td>
                    <td></td>
                    <td class="cell-right cell-bold">${formatCurrency(part1Total)}</td>
                </tr>
            </tbody>
        </table>
    `;
    container.appendChild(part1Card);
    
    // --- PARTE 2 ---
    const part2Card = document.createElement('div');
    part2Card.className = 'table-card excel-theme';
    
    let part2Rows = '';
    let part2TotalHours = 0;
    let part2TotalVal = 0;
    const tariffaDiurna = calculateOreExtraTariff(base, markup, discount, 0);
    
    (month.part2 || []).forEach((day, index) => {
        const dObj = new Date(day.date);
        const dayNum = dObj.getDate();
        const weekdayStr = ITALIAN_WEEKDAYS[dObj.getDay()];
        const dayImporto = (day.hours || 0) * tariffaDiurna;
        part2TotalHours += (day.hours || 0);
        part2TotalVal += dayImporto;
        
        part2Rows += `
            <tr>
                <td class="cell-center cell-bold">${dayNum}</td>
                <td>${weekdayStr.toUpperCase()}</td>
                <td class="cell-center"><input type="number" class="p2-hours-input form-control-cell" data-idx="${index}" value="${day.hours || 0}" step="0.5" style="width: 80px; text-align: center;"></td>
                <td class="cell-right">${formatCurrency(tariffaDiurna)}</td>
                <td class="cell-right cell-bold">${formatCurrency(dayImporto)}</td>
                <td class="cell-center">
                    <button class="btn btn-outline btn-icon-only delete-ore-day-btn" data-idx="${index}" title="Rimuovi giorno" style="color: var(--danger); padding: 2px;">
                        <i data-lucide="trash-2"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    part2Card.innerHTML = `
        <div class="table-header-title" style="display: flex; justify-content: space-between; align-items: center;">
            <span>PARTE 2: ORE AGGIUNTIVE SECONDA RISORSA (TARIFFE FERIALI DIURNE)</span>
            <button class="btn btn-outline delete-all-p2-btn" style="color: var(--danger); border-color: var(--danger); padding: 4px 10px; font-size: 0.8rem; display: flex; align-items: center; gap: 6px; cursor: pointer;">
                <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i> Rimuovi tutti i giorni
            </button>
        </div>
        <table class="excel-table">
            <thead>
                <tr>
                    <th style="width: 80px; text-align: center;">GIORNO</th>
                    <th>GIORNO SETTIMANA</th>
                    <th style="width: 120px; text-align: center;">ORE LAVORATE</th>
                    <th style="width: 180px; text-align: right;">TARIFFA DIURNA (€)</th>
                    <th style="width: 180px; text-align: right;">IMPORTO TOTALE (€)</th>
                    <th style="width: 80px; text-align: center;">Azioni</th>
                </tr>
            </thead>
            <tbody>
                ${part2Rows}
                <tr class="excel-total-row">
                    <td colspan="2" class="cell-bold">TOTALE SECONDA RISORSA</td>
                    <td class="cell-center cell-bold">${part2TotalHours} ore</td>
                    <td></td>
                    <td class="cell-right cell-bold">${formatCurrency(part2TotalVal)}</td>
                    <td></td>
                </tr>
                <tr class="excel-total-row" style="background: rgba(245, 158, 11, 0.15);">
                    <td colspan="4" class="cell-bold" style="font-size: 1.1rem; color: #f59e0b;">TOTALE MENSILE GENERALE (PARTE 1 + PARTE 2)</td>
                    <td class="cell-right cell-bold" style="font-size: 1.1rem; color: #f59e0b;">${formatCurrency(part1Total + part2TotalVal)}</td>
                    <td></td>
                </tr>
            </tbody>
        </table>
    `;
    container.appendChild(part2Card);
    
    // Attach Input Event Listeners for inline changes
    part1Card.querySelectorAll('.p1-ore-input').forEach(inp => {
        inp.addEventListener('change', (e) => {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            month.part1[idx].oreGg = Number(e.target.value) || 0;
            saveState();
            renderActiveOreExtraSheetContent();
        });
    });
    part1Card.querySelectorAll('.p1-gg-input').forEach(inp => {
        inp.addEventListener('change', (e) => {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            month.part1[idx].giorni = parseInt(e.target.value) || 0;
            saveState();
            renderActiveOreExtraSheetContent();
        });
    });
    part2Card.querySelectorAll('.p2-hours-input').forEach(inp => {
        inp.addEventListener('change', (e) => {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            month.part2[idx].hours = Number(e.target.value) || 0;
            saveState();
            renderActiveOreExtraSheetContent();
        });
    });
    part2Card.querySelectorAll('.delete-ore-day-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
            if (confirm(`Sei sicuro di voler rimuovere questa giornata?`)) {
                month.part2.splice(idx, 1);
                saveState();
                renderActiveOreExtraSheetContent();
            }
        });
    });
    
    const deleteAllBtn = part2Card.querySelector('.delete-all-p2-btn');
    if (deleteAllBtn) {
        deleteAllBtn.addEventListener('click', () => {
            if (confirm(`Sei sicuro di voler rimuovere TUTTE le giornate della seconda risorsa?`)) {
                month.part2 = [];
                saveState();
                renderActiveOreExtraSheetContent();
            }
        });
    }
    
    // Rendering ed associazione gestori per giorni ripristinabili
    if (missingDays.length > 0) {
        const restoreDiv = document.createElement('div');
        let badges = '';
        missingDays.forEach(day => {
            const dNum = new Date(day.date).getDate();
            badges += `
                <button class="btn btn-outline btn-xs restore-day-btn" data-date="${day.date}" style="padding: 2px 8px; font-size: 0.8rem; margin: 2px; border-color: #f59e0b; color: #f59e0b;">
                    + Giorno ${dNum}
                </button>
            `;
        });
        restoreDiv.innerHTML = `
            <div style="margin-top: 16px; background: rgba(245, 158, 11, 0.05); padding: 12px; border-radius: 8px; border: 1px dashed rgba(245, 158, 11, 0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
                    <div style="font-weight: bold; font-size: 0.85rem; color: #d97706;">
                        <i data-lucide="plus-circle" style="display: inline-block; width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></i>
                        Ripristina giorni eliminati della seconda risorsa:
                    </div>
                    <button class="btn btn-outline restore-all-p2-btn" style="padding: 2px 8px; font-size: 0.8rem; border-color: #f59e0b; color: #f59e0b; cursor: pointer;">
                        + Ripristina tutti i giorni
                    </button>
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                    ${badges}
                </div>
            </div>
        `;
        container.appendChild(restoreDiv);
        
        const restoreAllBtn = restoreDiv.querySelector('.restore-all-p2-btn');
        if (restoreAllBtn) {
            restoreAllBtn.addEventListener('click', () => {
                month.part2 = JSON.parse(JSON.stringify(allDays));
                saveState();
                renderActiveOreExtraSheetContent();
            });
        }
        
        restoreDiv.querySelectorAll('.restore-day-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetDate = e.currentTarget.getAttribute('data-date');
                const dayToRestore = allDays.find(d => d.date === targetDate);
                if (dayToRestore) {
                    month.part2.push(JSON.parse(JSON.stringify(dayToRestore)));
                    month.part2.sort((a, b) => new Date(a.date) - new Date(b.date));
                    saveState();
                    renderActiveOreExtraSheetContent();
                }
            });
        });
    }
}

// --- GESTIONE COMMESSE (SOPRA CATEGORIA) ---

function renderCommessaSelector() {
    const activeSelect = document.getElementById('active-commessa-select');
    const addPrevSelect = document.getElementById('add-prev-commessa');
    const addConsSelect = document.getElementById('add-cons-commessa');
    const addOreSelect = document.getElementById('add-ore-commessa');

    if (!activeSelect) return;

    // Popola selettore attivo in sidebar
    let activeOptions = `<option value="all" ${state.activeCommessaId === 'all' ? 'selected' : ''}>Tutte le commesse</option>`;
    state.commesse.forEach(c => {
        activeOptions += `<option value="${c.id}" ${state.activeCommessaId === c.id ? 'selected' : ''}>${c.nome}</option>`;
    });
    activeSelect.innerHTML = activeOptions;

    // Popola select nelle modali di creazione
    let modalOptions = '';
    state.commesse.forEach(c => {
        // Pre-seleziona la commessa attiva se non è 'all'
        const isSelected = state.activeCommessaId === c.id;
        modalOptions += `<option value="${c.id}" ${isSelected ? 'selected' : ''}>${c.nome}</option>`;
    });

    if (addPrevSelect) addPrevSelect.innerHTML = modalOptions;
    if (addConsSelect) addConsSelect.innerHTML = modalOptions;
    if (addOreSelect) addOreSelect.innerHTML = modalOptions;

    // Aggiorna dinamicamente i committenti consigliati
    renderCommittentiDatalist();
}

function renderCommittentiDatalist() {
    const datalist = document.getElementById('committenti-list');
    if (!datalist) return;

    // Raccoglie tutti i committenti (base e quelli creati dall'utente)
    const committentiSet = new Set(['RAI', 'RAI WAY', 'INPS', 'REGIONE LOMBARDIA']);
    
    (state.commesse || []).forEach(c => {
        if (c.committenteDefault) committentiSet.add(c.committenteDefault.trim().toUpperCase());
    });
    
    (state.preventivi || []).forEach(p => {
        if (p.committente) committentiSet.add(p.committente.trim().toUpperCase());
    });

    (state.consuntivi || []).forEach(c => {
        if (c.committente) committentiSet.add(c.committente.trim().toUpperCase());
    });

    (state.oreExtra || []).forEach(oe => {
        if (oe.committente) committentiSet.add(oe.committente.trim().toUpperCase());
    });

    let optionsHTML = '';
    Array.from(committentiSet).sort().forEach(c => {
        optionsHTML += `<option value="${c}"></option>`;
    });
    datalist.innerHTML = optionsHTML;
}

function openManageCommesseModal() {
    try {
        const modal = document.getElementById('modal-manage-commesse');
        if (!modal) {
            alert("Errore: Elemento modal-manage-commesse non trovato nel DOM!");
            return;
        }
        
        // Pulisce i campi
        document.getElementById('new-commessa-name').value = '';
        document.getElementById('new-commessa-client').value = 'RAI';
        
        renderManageCommesseList();
        modal.classList.add('active');
        
        if (window.lucide) {
            window.lucide.createIcons();
        }
    } catch (err) {
        alert("Errore in openManageCommesseModal: " + err.message + "\n" + err.stack);
        console.error(err);
    }
}

function renderManageCommesseList() {
    const tbody = document.getElementById('commesse-manage-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (state.commesse.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">Nessuna commessa creata</td></tr>`;
        return;
    }

    state.commesse.forEach(c => {
        const tr = document.createElement('tr');
        
        // Calcola quanti elementi sono associati a questa commessa
        const prevCount = (state.preventivi || []).filter(p => p && p.commessaId === c.id).length;
        const consCount = (state.consuntivi || []).filter(co => co && co.commessaId === c.id).length;
        const oreCount = (state.oreExtra || []).filter(oe => oe && oe.commessaId === c.id).length;
        const totalItems = prevCount + consCount + oreCount;

        tr.innerHTML = `
            <td><strong>${c.nome}</strong></td>
            <td><span class="badge badge-sent">${c.committenteDefault}</span></td>
            <td class="cell-center">
                <div style="display: flex; gap: 8px; justify-content: center;">
                    <button class="btn btn-outline btn-icon-only edit-commessa-btn" data-id="${c.id}" title="Modifica Nome" style="padding: 4px;">
                        <i data-lucide="edit-3" style="width: 14px; height: 14px;"></i>
                    </button>
                    <button class="btn btn-outline btn-icon-only delete-commessa-btn" data-id="${c.id}" data-total="${totalItems}" title="Elimina" style="color: var(--danger); padding: 4px;">
                        <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Attach list handlers
    tbody.querySelectorAll('.edit-commessa-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const comm = state.commesse.find(c => c.id === id);
            if (comm) {
                const nuovoNome = prompt("Inserisci il nuovo nome per la commessa:", comm.nome);
                if (nuovoNome && nuovoNome.trim()) {
                    comm.nome = nuovoNome.trim();
                    saveState();
                    renderCommessaSelector();
                    renderManageCommesseList();
                }
            }
        });
    });

    tbody.querySelectorAll('.delete-commessa-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const total = parseInt(e.currentTarget.getAttribute('data-total')) || 0;
            const comm = state.commesse.find(c => c.id === id);
            if (!comm) return;

            if (total > 0) {
                if (!confirm(`Attenzione! Questa commessa contiene ${total} elementi (preventivi, consuntivi o ore extra).\n\nEliminando la commessa verranno eliminati PERMANENTEMENTE anche tutti i relativi documenti ad essa associati.\n\nSei sicuro di voler procedere con l'eliminazione?`)) {
                    return;
                }
            } else {
                if (!confirm(`Sei sicuro di voler eliminare la commessa "${comm.nome}"?`)) {
                    return;
                }
            }

            // Rimuovi commessa
            state.commesse = state.commesse.filter(c => c.id !== id);
            
            // Rimuovi elementi collegati
            state.preventivi = state.preventivi.filter(p => p.commessaId !== id);
            state.consuntivi = state.consuntivi.filter(co => co.commessaId !== id);
            state.oreExtra = state.oreExtra.filter(oe => oe.commessaId !== id);

            // Se la commessa eliminata era quella attiva, reimposta a 'all'
            if (state.activeCommessaId === id) {
                state.activeCommessaId = 'all';
            }

            saveState();
            renderCommessaSelector();
            renderManageCommesseList();
            
            // Ricarica la vista corrente per riflettere le eliminazioni
            switchView(state.activeView);
        });
    });
}

function addCommessaSubmit() {
    try {
        const nomeInput = document.getElementById('new-commessa-name');
        const clientSelect = document.getElementById('new-commessa-client');
        
        const nome = nomeInput.value ? nomeInput.value.trim() : '';
        const client = clientSelect.value;
        
        if (!nome) {
            alert('Inserire un nome per la commessa.');
            return;
        }
        
        const id = 'comm-' + Date.now();
        const nuovaCommessa = {
            id: id,
            nome: nome,
            committenteDefault: client
        };
        
        state.commesse.push(nuovaCommessa);
        
        // Imposta direttamente come commessa attiva
        state.activeCommessaId = id;
        saveState();
        
        nomeInput.value = '';
        renderCommessaSelector();
        
        // Chiude la modale di gestione
        const modal = document.getElementById('modal-manage-commesse');
        if (modal) modal.classList.remove('active');
        
        // Ricarica la vista per riflettere il cambio
        switchView(state.activeView);
        
        // Alert di successo
        alert(`Commessa "${nome}" creata e impostata come attiva con successo!`);
    } catch (err) {
        alert("Errore in addCommessaSubmit: " + err.message + "\n" + err.stack);
        console.error(err);
    }
}

// --- ACCENSIONI / EVENTI DI AVVIO ---
document.addEventListener('DOMContentLoaded', () => {
    // Inizializza stato
    loadState();
    
    // Inizializza selettori commesse
    renderCommessaSelector();
    
    // Cambia commessa attiva
    document.getElementById('active-commessa-select')?.addEventListener('change', (e) => {
        state.activeCommessaId = e.target.value;
        saveState();
        renderCommessaSelector(); // Mantiene sincronizzate le select modali
        switchView(state.activeView);
    });

    // Gestione commesse modal
    document.getElementById('btn-manage-commesse')?.addEventListener('click', openManageCommesseModal);
    document.getElementById('btn-add-commessa-submit')?.addEventListener('click', addCommessaSubmit);
    
    // Aggancia eventi menu laterale
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const view = e.currentTarget.getAttribute('data-view');
            switchView(view);
        });
    });
    
    // Switch tema
    document.getElementById('theme-toggle').addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        
        state.settings.theme = newTheme;
        saveState();
    });
    
    // Ricerca filtri preventivi
    document.getElementById('search-preventivi')?.addEventListener('input', () => {
        renderPreventiviList();
    });
    document.getElementById('filter-preventivi-status')?.addEventListener('change', () => {
        renderPreventiviList();
    });
    
    // Ricerca filtri consuntivi
    document.getElementById('search-consuntivi')?.addEventListener('input', () => {
        renderConsuntiviList();
    });
    document.getElementById('filter-consuntivi-status')?.addEventListener('change', () => {
        renderConsuntiviList();
    });
    
    // Ricerca filtri ore extra
    document.getElementById('search-oreExtra')?.addEventListener('input', () => {
        renderOreExtraList();
    });
    document.getElementById('filter-oreExtra-status')?.addEventListener('change', () => {
        renderOreExtraList();
    });
    
    // Pulsanti aggiungi
    document.getElementById('btn-new-preventivo').addEventListener('click', openAddPreventivoModal);
    document.getElementById('btn-new-consuntivo').addEventListener('click', openAddConsuntivoModal);
    document.getElementById('btn-new-oreExtra').addEventListener('click', () => {
        const modal = document.getElementById('modal-add-oreExtra');
        document.getElementById('add-ore-name').value = `ORE EXTRA 3Q${new Date().getFullYear()}`;
        
        renderCommessaSelector();
        const commessaSelect = document.getElementById('add-ore-commessa');
        const clientSelect = document.getElementById('add-ore-client');
        
        if (state.activeCommessaId !== 'all') {
            commessaSelect.value = state.activeCommessaId;
            commessaSelect.disabled = true;
            const comm = state.commesse.find(c => c.id === state.activeCommessaId);
            if (comm && clientSelect) {
                clientSelect.value = comm.committenteDefault || 'RAI';
            }
        } else {
            commessaSelect.disabled = false;
            if (state.commesse.length > 0) {
                commessaSelect.selectedIndex = 0;
                const comm = state.commesse[0];
                if (clientSelect) {
                    clientSelect.value = comm.committenteDefault || 'RAI';
                }
            }
        }
        modal.classList.add('active');
    });

    // Sincronizzazione automatica committente nelle modali quando si cambia commessa
    document.getElementById('add-prev-commessa')?.addEventListener('change', (e) => {
        const comm = state.commesse.find(c => c.id === e.target.value);
        if (comm) {
            const clientSelect = document.getElementById('add-prev-client');
            if (clientSelect) clientSelect.value = comm.committenteDefault || 'RAI';
        }
    });
    document.getElementById('add-cons-commessa')?.addEventListener('change', (e) => {
        const comm = state.commesse.find(c => c.id === e.target.value);
        if (comm) {
            const clientSelect = document.getElementById('add-cons-client');
            if (clientSelect) clientSelect.value = comm.committenteDefault || 'RAI';
        }
    });
    document.getElementById('add-ore-commessa')?.addEventListener('change', (e) => {
        const comm = state.commesse.find(c => c.id === e.target.value);
        if (comm) {
            const clientSelect = document.getElementById('add-ore-client');
            if (clientSelect) clientSelect.value = comm.committenteDefault || 'RAI';
        }
    });
    
    // Chiudi modali al click esterno
    document.querySelectorAll('.modal-close, .btn-cancel-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-overlay');
            if (modal) modal.classList.remove('active');
        });
    });
    
    // Submit dei form modali
    document.getElementById('btn-submit-add-prev').addEventListener('click', submitAddPreventivo);
    document.getElementById('btn-submit-add-cons').addEventListener('click', submitAddConsuntivo);
    document.getElementById('btn-submit-add-ore').addEventListener('click', submitAddOreExtra);
    document.getElementById('btn-submit-add-month').addEventListener('click', submitAddMonth);
    document.getElementById('btn-submit-report').addEventListener('click', submitReportDetails);
    
    // Pulsanti toolbar preventivo editor
    document.getElementById('prev-btn-save').addEventListener('click', () => {
        saveState();
        alert('Preventivo salvato correttamente!');
    });
    document.getElementById('prev-btn-excel').addEventListener('click', async () => {
        if (activePrevObj) {
            await ExcelExporter.exportPreventivo(activePrevObj);
        }
    });
    document.getElementById('prev-btn-pdf').addEventListener('click', async () => {
        if (activePrevObj) {
            PDFExporter.showPrintPreview(activePrevObj, `PREVENTIVO-${activePrevObj.number || 'OFFERTA'}.pdf`);
        }
    });
    
    // Pulsanti add riga preventivo
    document.getElementById('prev-add-materiale-btn').addEventListener('click', () => addPreventivoRow('materiali'));
    document.getElementById('prev-add-manodopera-btn').addEventListener('click', () => addPreventivoRow('manodopera'));
    
    // Pulsanti toolbar consuntivo editor
    document.getElementById('cons-btn-save').addEventListener('click', () => {
        saveState();
        alert('Consuntivo salvato correttamente!');
    });
    document.getElementById('cons-btn-excel').addEventListener('click', async () => {
        if (activeConsObj) {
            await ExcelExporter.exportConsuntivo(activeConsObj);
        }
    });
    document.getElementById('cons-btn-pdf').addEventListener('click', async () => {
        if (activeConsObj) {
            PDFExporter.showConsuntivoPreview(activeConsObj);
        }
    });
    
    // Ricalcolo percentuali consuntivo
    document.getElementById('cons-edit-markup').addEventListener('change', (e) => {
        activeConsObj.markupPercent = Number(e.target.value) || 0;
        saveState();
        updateConsuntivoMarginDisplay();
        renderActiveSheetContent();
    });
    document.getElementById('cons-edit-discount').addEventListener('change', (e) => {
        activeConsObj.discountPercent = Number(e.target.value) || 0;
        saveState();
        updateConsuntivoMarginDisplay();
        renderActiveSheetContent();
    });
    document.getElementById('cons-edit-formula').addEventListener('change', (e) => {
        activeConsObj.formulaType = e.target.value;
        saveState();
        updateConsuntivoMarginDisplay();
        renderActiveSheetContent();
    });
    
    // Pulsanti toolbar ore extra editor
    document.getElementById('ore-btn-save').addEventListener('click', () => {
        saveState();
        alert('Registro Ore Extra salvato correttamente!');
    });
    document.getElementById('ore-btn-excel').addEventListener('click', async () => {
        if (activeOreObj) {
            await ExcelExporter.exportOreExtra(activeOreObj);
        }
    });
    document.getElementById('ore-btn-pdf').addEventListener('click', async () => {
        if (activeOreObj) {
            PDFExporter.showOreExtraPreview(activeOreObj);
        }
    });
    
    // Ricalcolo parametri contrattuali ore extra
    document.getElementById('ore-edit-costobase').addEventListener('change', (e) => {
        if (activeOreObj) {
            activeOreObj.costoBase = Number(e.target.value) || 0;
            saveState();
            renderActiveOreExtraSheetContent();
        }
    });
    document.getElementById('ore-edit-markup').addEventListener('change', (e) => {
        if (activeOreObj) {
            activeOreObj.markupPercent = Number(e.target.value) || 0;
            saveState();
            renderActiveOreExtraSheetContent();
        }
    });
    document.getElementById('ore-edit-discount').addEventListener('change', (e) => {
        if (activeOreObj) {
            activeOreObj.discountPercent = Number(e.target.value) || 0;
            saveState();
            renderActiveOreExtraSheetContent();
        }
    });
    document.getElementById('ore-edit-formula').addEventListener('change', (e) => {
        if (activeOreObj) {
            activeOreObj.formulaType = e.target.value;
            saveState();
            renderActiveOreExtraSheetContent();
        }
    });
    
    // Salvataggio impostazioni
    document.getElementById('set-btn-save').addEventListener('click', saveSettingsFromUI);
    
    // Backup e Ripristino
    document.getElementById('btn-backup-export').addEventListener('click', exportBackup);
    const btnBackupExportHome = document.getElementById('btn-backup-export-home');
    if (btnBackupExportHome) {
        btnBackupExportHome.addEventListener('click', exportBackup);
    }

    document.getElementById('btn-backup-import').addEventListener('click', () => {
        document.getElementById('backup-file-input').click();
    });
    const btnBackupImportHome = document.getElementById('btn-backup-import-home');
    if (btnBackupImportHome) {
        btnBackupImportHome.addEventListener('click', () => {
            document.getElementById('backup-file-input').click();
        });
    }

    document.getElementById('backup-file-input').addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            importBackup(e.target.files[0]);
            e.target.value = ''; // Reset per consentire reimportazione stesso file
        }
    });
    
    // Aggiornamento metadati consuntivo
    const consMetaInputs = [
        { id: 'cons-meta-company', field: 'companyName' },
        { id: 'cons-meta-ca', field: 'caPerson' },
        { id: 'cons-meta-ca2', field: 'caPerson2' },
        { id: 'cons-meta-date', field: 'date' },
        { id: 'cons-meta-committente', field: 'committente' },
        { id: 'cons-meta-presidio', field: 'presidio' },
        { id: 'cons-meta-odl', field: 'odl' },
        { id: 'cons-meta-prevcode', field: 'prevCode' },
        { id: 'cons-meta-intervento', field: 'areaIntervento' },
        { id: 'cons-meta-oggetto', field: 'oggetto' },
        { id: 'cons-meta-name', field: 'name' },
        { id: 'cons-edit-status', field: 'status' },
        { id: 'cons-edit-bilancino', field: 'bilancino' }
    ];
    consMetaInputs.forEach(m => {
        const el = document.getElementById(m.id);
        if (el) {
            el.addEventListener('change', (e) => {
                if (activeConsObj) {
                    activeConsObj[m.field] = e.target.value;
                    saveState();
                }
            });
        }
    });
    
    // Aggiornamento metadati ore extra
    const oreMetaInputs = [
        { id: 'ore-meta-company', field: 'companyName' },
        { id: 'ore-meta-ca', field: 'caPerson' },
        { id: 'ore-meta-ca2', field: 'caPerson2' },
        { id: 'ore-meta-date', field: 'date' },
        { id: 'ore-meta-committente', field: 'committente' },
        { id: 'ore-meta-presidio', field: 'presidio' },
        { id: 'ore-meta-odl', field: 'odl' },
        { id: 'ore-meta-prevcode', field: 'prevCode' },
        { id: 'ore-meta-intervento', field: 'areaIntervento' },
        { id: 'ore-meta-name', field: 'name' },
        { id: 'ore-edit-status', field: 'status' },
        { id: 'ore-edit-bilancino', field: 'bilancino' }
    ];
    oreMetaInputs.forEach(m => {
        const el = document.getElementById(m.id);
        if (el) {
            el.addEventListener('change', (e) => {
                if (activeOreObj) {
                    activeOreObj[m.field] = e.target.value;
                    saveState();
                }
            });
        }
    });
    
    // Ricerca filtri rapporti
    document.getElementById('search-rapporti')?.addEventListener('input', () => {
        renderRapportiList();
    });
    document.getElementById('filter-rapporti-status')?.addEventListener('change', () => {
        renderRapportiList();
    });

    // Pulsanti toolbar rapporti editor
    document.getElementById('rapp-btn-save')?.addEventListener('click', () => {
        saveState();
        alert('Rapporto di Lavoro salvato correttamente!');
    });
    document.getElementById('rapp-btn-excel')?.addEventListener('click', async () => {
        if (activeRapportoObj) {
            await ExcelExporter.exportRapportoLavoro(activeRapportoObj);
        }
    });
    document.getElementById('rapp-btn-pdf')?.addEventListener('click', async () => {
        if (activeRapportoObj) {
            PDFExporter.showPrintPreview(activeRapportoObj, `RAPPORTO_LAVORO_${activeRapportoObj.number || 'VUOTO'}.pdf`);
        }
    });

    document.getElementById('rapp-add-operatore-btn')?.addEventListener('click', () => addRapportoRow('operatori'));
    document.getElementById('rapp-add-materiale-btn')?.addEventListener('click', () => addRapportoRow('materiali'));

    document.getElementById('btn-new-rapporto').addEventListener('click', openAddRapportoModal);
    document.getElementById('btn-submit-add-rapp').addEventListener('click', submitAddRapporto);

    document.getElementById('add-rapp-commessa')?.addEventListener('change', (e) => {
        const comm = state.commesse.find(c => c.id === e.target.value);
        if (comm) {
            const clientInput = document.getElementById('add-rapp-client');
            if (clientInput) clientInput.value = comm.committenteDefault || 'RAI';
        }
    });

    // Avvia sulla dashboard
    switchView('dashboard');
});

// --- VISTA RAPPORTI DI LAVORO ---
function renderRapportiList() {
    const tbody = document.getElementById('rapporti-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const searchVal = document.getElementById('search-rapporti')?.value.toLowerCase() || '';
    const statusVal = document.getElementById('filter-rapporti-status')?.value || 'all';

    const filtered = (state.rapporti || []).filter(r => {
        const matchCommessa = state.activeCommessaId === 'all' || r.commessaId === state.activeCommessaId;
        const matchSearch = (r.number || '').toLowerCase().includes(searchVal) ||
                            (r.cliente || '').toLowerCase().includes(searchVal) ||
                            (r.descrizioneIntervento || '').toLowerCase().includes(searchVal) ||
                            (r.citta || '').toLowerCase().includes(searchVal);
        const matchStatus = statusVal === 'all' || r.status === statusVal;
        return matchCommessa && matchSearch && matchStatus;
    });

    filtered.sort((a, b) => (b.number || '').localeCompare(a.number || '', 'it', { numeric: true }));

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">Nessun rapporto di lavoro trovato</td></tr>`;
        return;
    }

    filtered.forEach(r => {
        const tr = document.createElement('tr');
        let statusBadge = '';
        if (r.status === 'draft') statusBadge = '<span class="badge badge-draft">Bozza</span>';
        else if (r.status === 'sent') statusBadge = '<span class="badge badge-sent">Inviato</span>';
        else if (r.status === 'approved') statusBadge = '<span class="badge badge-approved">Approvato</span>';
        else if (r.status === 'rejected') statusBadge = '<span class="badge badge-rejected">Respinto</span>';

        tr.innerHTML = `
            <td><strong>#${r.number || '---'}</strong></td>
            <td>${r.dataLavori || '---'}</td>
            <td>${r.cliente || '---'}</td>
            <td>${r.citta || '---'}</td>
            <td><div style="max-width: 320px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${r.descrizioneIntervento}">${r.descrizioneIntervento || '---'}</div></td>
            <td>${statusBadge}</td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-outline btn-icon-only edit-rapp-btn" data-id="${r.id}" title="Modifica">
                        <i data-lucide="edit"></i>
                    </button>
                    <button class="btn btn-outline btn-icon-only excel-rapp-btn" data-id="${r.id}" title="Esporta Excel" style="color: #22c55e;">
                        <i data-lucide="file-spreadsheet"></i>
                    </button>
                    <button class="btn btn-outline btn-icon-only pdf-rapp-btn" data-id="${r.id}" title="Esporta PDF" style="color: #ef4444;">
                        <i data-lucide="file-text"></i>
                    </button>
                    <button class="btn btn-outline btn-icon-only delete-rapp-btn" data-id="${r.id}" title="Elimina" style="color: var(--danger);">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    lucide.createIcons();
    attachRapportiListEventHandlers();
}

function attachRapportiListEventHandlers() {
    document.querySelectorAll('.edit-rapp-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            switchView('rapporti-edit', id);
        });
    });

    document.querySelectorAll('.excel-rapp-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const rapp = state.rapporti.find(r => r.id === id);
            if (rapp) {
                btn.disabled = true;
                await ExcelExporter.exportRapportoLavoro(rapp);
                btn.disabled = false;
            }
        });
    });

    document.querySelectorAll('.pdf-rapp-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const rapp = state.rapporti.find(r => r.id === id);
            if (rapp) {
                switchView('rapporti-edit', id);
                setTimeout(() => {
                    PDFExporter.showPrintPreview(rapp, `RAPPORTO_LAVORO_${rapp.number || 'VUOTO'}.pdf`);
                }, 200);
            }
        });
    });

    document.querySelectorAll('.delete-rapp-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const rapp = state.rapporti.find(r => r.id === id);
            if (confirm(`Sei sicuro di voler eliminare il Rapporto di Lavoro #${rapp.number || ''}?`)) {
                state.rapporti = state.rapporti.filter(r => r.id !== id);
                saveState();
                renderRapportiList();
            }
        });
    });
}

let activeRapportoObj = null;

function renderRapportiEditor() {
    activeRapportoObj = state.rapporti.find(r => r.id === state.editingId);
    if (!activeRapportoObj) {
        switchView('rapporti-list');
        return;
    }

    // Pulisce tutti i listener precedenti clonando il contenitore principale
    const tableContainer = document.getElementById('rapporto-sheet-container');
    if (tableContainer) {
        tableContainer.replaceWith(tableContainer.cloneNode(true));
    }

    // Imposta campi testata
    document.getElementById('rapp-meta-num-title').value = activeRapportoObj.number || '';
    document.getElementById('rapp-meta-num').value = activeRapportoObj.number || '';
    document.getElementById('rapp-meta-richiesta').value = activeRapportoObj.richiestaNum || '';
    document.getElementById('rapp-meta-ditta').value = activeRapportoObj.dittaEsecutrice || 'Rekeep SpA';

    // Dati Cliente/Ubicazione
    document.getElementById('rapp-meta-cliente').value = activeRapportoObj.cliente || '';
    document.getElementById('rapp-meta-via').value = activeRapportoObj.via || '';
    document.getElementById('rapp-meta-civico').value = activeRapportoObj.civico || '';
    document.getElementById('rapp-meta-citta').value = activeRapportoObj.citta || '';
    document.getElementById('rapp-meta-edificio').value = activeRapportoObj.edificio || '';
    document.getElementById('rapp-meta-piano').value = activeRapportoObj.piano || '';
    document.getElementById('rapp-meta-vano').value = activeRapportoObj.vano || '';

    // Checkbox Tipologia di Intervento
    const tipos = activeRapportoObj.tipologiaIntervento || [];
    document.querySelectorAll('input[name="rapp-tipo"]').forEach(cb => {
        cb.checked = tipos.includes(cb.value);
    });

    // Checkbox Causa Intervento
    const cause = activeRapportoObj.causaIntervento || [];
    document.querySelectorAll('input[name="rapp-causa"]').forEach(cb => {
        cb.checked = cause.includes(cb.value);
    });
    const causaAltroInput = document.getElementById('rapp-causa-altro');
    if (causaAltroInput) {
        causaAltroInput.value = activeRapportoObj.causaInterventoAltro || '';
        causaAltroInput.style.display = cause.includes('ALTRO') ? 'block' : 'none';
    }

    // Checkbox Lavori Eseguiti
    const lavori = activeRapportoObj.lavoriEseguiti || [];
    document.querySelectorAll('input[name="rapp-lavori"]').forEach(cb => {
        cb.checked = lavori.includes(cb.value);
    });
    const lavoriAltroInput = document.getElementById('rapp-lavori-altro');
    if (lavoriAltroInput) {
        lavoriAltroInput.value = activeRapportoObj.lavoriEseguitiAltro || '';
        lavoriAltroInput.style.display = lavori.includes('ALTRO') ? 'block' : 'none';
    }

    // Descrizione Intervento
    document.getElementById('rapp-meta-descrizione').value = activeRapportoObj.descrizioneIntervento || '';

    // Anomalie e Azioni
    document.getElementById('rapp-meta-anomalie').value = activeRapportoObj.anomalieDescrizione || '';
    document.getElementById('rapp-meta-correttive').value = activeRapportoObj.anomalieAzioni || '';

    // Data e Firme
    document.getElementById('rapp-meta-data-lavori').value = activeRapportoObj.dataLavori || '';
    document.getElementById('rapp-meta-firma-esecutore').value = activeRapportoObj.firmaEsecutore || '';
    document.getElementById('rapp-meta-firma-referente').value = activeRapportoObj.referenteCliente || '';
    document.getElementById('rapp-meta-firma-responsabile').value = activeRapportoObj.responsabile || '';

    document.getElementById('rapp-edit-status').value = activeRapportoObj.status || 'draft';

    // Renderizza Tabelle
    renderRapportiEditorTables();
    attachRapportiEditorEventHandlers();
}

function renderRapportiEditorTables() {
    const tbodyOperatori = document.getElementById('rapp-operatori-tbody');
    const tbodyMateriali = document.getElementById('rapp-materiali-tbody');

    tbodyOperatori.innerHTML = '';
    tbodyMateriali.innerHTML = '';

    // Operatori
    const ops = activeRapportoObj.operatori || [];
    ops.forEach(op => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="editable-cell"><input type="text" class="cell-input op-name" value="${op.cognomeNome || ''}"></td>
            <td class="editable-cell"><input type="text" class="cell-input op-dalle cell-center" value="${op.dalleOre || ''}" placeholder="hh:mm"></td>
            <td class="editable-cell"><input type="text" class="cell-input op-alle cell-center" value="${op.alleOre || ''}" placeholder="hh:mm"></td>
            <td class="editable-cell"><input type="number" class="cell-input op-ord cell-right" value="${op.oreOrd || ''}" step="any"></td>
            <td class="editable-cell"><input type="number" class="cell-input op-str cell-right" value="${op.oreStr || ''}" step="any"></td>
            <td class="editable-cell"><input type="number" class="cell-input op-fest cell-right" value="${op.oreFest || ''}" step="any"></td>
            <td class="editable-cell"><input type="number" class="cell-input op-viaggio cell-right" value="${op.oreViaggio || ''}" step="any"></td>
            <td class="editable-cell"><input type="number" class="cell-input op-spese cell-right" value="${op.speseVarie || ''}" step="any"></td>
            <td class="row-actions-td">
                <button class="row-action-btn delete-op-row" data-id="${op.id}" title="Elimina Riga">
                    <i data-lucide="minus-circle"></i>
                </button>
            </td>
        `;
        tbodyOperatori.appendChild(tr);
    });

    // Materiali
    const mats = activeRapportoObj.materiali || [];
    mats.forEach(mat => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="editable-cell"><input type="text" class="cell-input mat-desc" value="${mat.descrizione || ''}"></td>
            <td class="editable-cell"><input type="text" class="cell-input mat-um cell-center" value="${mat.um || ''}"></td>
            <td class="editable-cell"><input type="number" class="cell-input mat-qty cell-right" value="${mat.qty || ''}" step="any"></td>
            <td class="row-actions-td">
                <button class="row-action-btn delete-mat-row" data-id="${mat.id}" title="Elimina Riga">
                    <i data-lucide="minus-circle"></i>
                </button>
            </td>
        `;
        tbodyMateriali.appendChild(tr);
    });

    lucide.createIcons();
    attachRapportiTablesDeleteHandlers();
}

function attachRapportiTablesDeleteHandlers() {
    document.querySelectorAll('.delete-op-row').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            activeRapportoObj.operatori = activeRapportoObj.operatori.filter(op => op.id !== id);
            saveState();
            renderRapportiEditorTables();
        });
    });

    document.querySelectorAll('.delete-mat-row').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            activeRapportoObj.materiali = activeRapportoObj.materiali.filter(mat => mat.id !== id);
            saveState();
            renderRapportiEditorTables();
        });
    });
}

function attachRapportiEditorEventHandlers() {
    const fields = [
        { id: 'rapp-meta-num', key: 'number' },
        { id: 'rapp-meta-richiesta', key: 'richiestaNum' },
        { id: 'rapp-meta-ditta', key: 'dittaEsecutrice' },
        { id: 'rapp-meta-cliente', key: 'cliente' },
        { id: 'rapp-meta-via', key: 'via' },
        { id: 'rapp-meta-civico', key: 'civico' },
        { id: 'rapp-meta-citta', key: 'citta' },
        { id: 'rapp-meta-edificio', key: 'edificio' },
        { id: 'rapp-meta-piano', key: 'piano' },
        { id: 'rapp-meta-vano', key: 'vano' },
        { id: 'rapp-meta-descrizione', key: 'descrizioneIntervento' },
        { id: 'rapp-meta-anomalie', key: 'anomalieDescrizione' },
        { id: 'rapp-meta-correttive', key: 'anomalieAzioni' },
        { id: 'rapp-meta-data-lavori', key: 'dataLavori' },
        { id: 'rapp-meta-firma-esecutore', key: 'firmaEsecutore' },
        { id: 'rapp-meta-firma-referente', key: 'referenteCliente' },
        { id: 'rapp-meta-firma-responsabile', key: 'responsabile' },
        { id: 'rapp-edit-status', key: 'status' }
    ];

    fields.forEach(f => {
        const el = document.getElementById(f.id);
        if (el) {
            el.addEventListener('change', (e) => {
                if (activeRapportoObj) {
                    activeRapportoObj[f.key] = e.target.value;
                    if (f.key === 'number') {
                        document.getElementById('rapp-meta-num-title').value = e.target.value;
                    }
                    saveState();
                }
            });
        }
    });

    // Checkbox Tipologia
    document.querySelectorAll('input[name="rapp-tipo"]').forEach(cb => {
        cb.addEventListener('change', () => {
            const selected = [];
            document.querySelectorAll('input[name="rapp-tipo"]:checked').forEach(c => {
                selected.push(c.value);
            });
            activeRapportoObj.tipologiaIntervento = selected;
            saveState();
        });
    });

    // Checkbox Causa
    document.querySelectorAll('input[name="rapp-causa"]').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const selected = [];
            document.querySelectorAll('input[name="rapp-causa"]:checked').forEach(c => {
                selected.push(c.value);
            });
            activeRapportoObj.causaIntervento = selected;
            document.getElementById('rapp-causa-altro').style.display = selected.includes('ALTRO') ? 'block' : 'none';
            saveState();
        });
    });

    const causaAltro = document.getElementById('rapp-causa-altro');
    if (causaAltro) {
        causaAltro.addEventListener('change', (e) => {
            activeRapportoObj.causaInterventoAltro = e.target.value;
            saveState();
        });
    }

    // Checkbox Lavori Eseguiti
    document.querySelectorAll('input[name="rapp-lavori"]').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const selected = [];
            document.querySelectorAll('input[name="rapp-lavori"]:checked').forEach(c => {
                selected.push(c.value);
            });
            activeRapportoObj.lavoriEseguiti = selected;
            document.getElementById('rapp-lavori-altro').style.display = selected.includes('ALTRO') ? 'block' : 'none';
            saveState();
        });
    });

    const lavoriAltro = document.getElementById('rapp-lavori-altro');
    if (lavoriAltro) {
        lavoriAltro.addEventListener('change', (e) => {
            activeRapportoObj.lavoriEseguitiAltro = e.target.value;
            saveState();
        });
    }

    const tableContainer = document.getElementById('rapporto-sheet-container');
    if (tableContainer) {
        tableContainer.addEventListener('change', (e) => {
            const target = e.target;
            if (target.classList.contains('op-name') || target.closest('#table-rapp-operatori')) {
                syncOperatoriFromUI();
            } else if (target.classList.contains('mat-desc') || target.closest('#table-rapp-materiali')) {
                syncMaterialiFromUI();
            }
        });
    }

    // Ricollega i listener per i pulsanti Aggiungi Operatore e Aggiungi Materiale che altrimenti verrebbero persi con la clonazione
    document.getElementById('rapp-add-operatore-btn')?.addEventListener('click', () => addRapportoRow('operatori'));
    document.getElementById('rapp-add-materiale-btn')?.addEventListener('click', () => addRapportoRow('materiali'));
}

function syncOperatoriFromUI() {
    const ops = [];
    const rows = document.querySelectorAll('#rapp-operatori-tbody tr');
    rows.forEach((row, i) => {
        const cognomeNome = row.querySelector('.op-name')?.value || '';
        const dalleOre = row.querySelector('.op-dalle')?.value || '';
        const alleOre = row.querySelector('.op-alle')?.value || '';
        const oreOrd = row.querySelector('.op-ord')?.value || '';
        const oreStr = row.querySelector('.op-str')?.value || '';
        const oreFest = row.querySelector('.op-fest')?.value || '';
        const oreViaggio = row.querySelector('.op-viaggio')?.value || '';
        const speseVarie = row.querySelector('.op-spese')?.value || '';

        const oldId = activeRapportoObj.operatori[i]?.id || ('op-' + Date.now() + '-' + i);
        ops.push({
            id: oldId,
            cognomeNome, dalleOre, alleOre, oreOrd, oreStr, oreFest, oreViaggio, speseVarie
        });
    });
    activeRapportoObj.operatori = ops;
    saveState();
}

function syncMaterialiFromUI() {
    const mats = [];
    const rows = document.querySelectorAll('#rapp-materiali-tbody tr');
    rows.forEach((row, i) => {
        const descrizione = row.querySelector('.mat-desc')?.value || '';
        const um = row.querySelector('.mat-um')?.value || '';
        const qty = row.querySelector('.mat-qty')?.value || '';

        const oldId = activeRapportoObj.materiali[i]?.id || ('mat-' + Date.now() + '-' + i);
        mats.push({
            id: oldId,
            descrizione, um, qty
        });
    });
    activeRapportoObj.materiali = mats;
    saveState();
}

function addRapportoRow(type) {
    if (!activeRapportoObj) return;
    if (type === 'operatori') {
        if (!activeRapportoObj.operatori) activeRapportoObj.operatori = [];
        activeRapportoObj.operatori.push({
            id: 'op-' + Date.now(),
            cognomeNome: '', dalleOre: '', alleOre: '', oreOrd: '', oreStr: '', oreFest: '', oreViaggio: '', speseVarie: ''
        });
    } else {
        if (!activeRapportoObj.materiali) activeRapportoObj.materiali = [];
        activeRapportoObj.materiali.push({
            id: 'mat-' + Date.now(),
            descrizione: '', um: '', qty: ''
        });
    }
    saveState();
    renderRapportiEditorTables();
}

function openAddRapportoModal() {
    const modal = document.getElementById('modal-add-rapporto');
    if (!modal) return;
    document.getElementById('add-rapp-number').value = '';
    
    const commSelect = document.getElementById('add-rapp-commessa');
    const clientInput = document.getElementById('add-rapp-client');
    if (commSelect) {
        commSelect.innerHTML = '';
        state.commesse.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.nome;
            commSelect.appendChild(opt);
        });

        if (state.activeCommessaId !== 'all') {
            commSelect.value = state.activeCommessaId;
            commSelect.disabled = true;
            const comm = state.commesse.find(c => c.id === state.activeCommessaId);
            if (comm && clientInput) {
                clientInput.value = comm.committenteDefault || 'RAI';
            }
        } else {
            commSelect.disabled = false;
            if (state.commesse.length > 0) {
                commSelect.selectedIndex = 0;
                const comm = state.commesse[0];
                if (clientInput) {
                    clientInput.value = comm.committenteDefault || 'RAI';
                }
            }
        }
    }
    modal.classList.add('active');
}

function submitAddRapporto() {
    const num = document.getElementById('add-rapp-number').value || '';
    const commessaId = document.getElementById('add-rapp-commessa').value;
    const client = document.getElementById('add-rapp-client').value || 'RAI';

    if (!num) {
        alert('Inserire un numero di rapporto.');
        return;
    }
    if (!commessaId) {
        alert('Selezionare una commessa.');
        return;
    }

    const newRapp = {
        id: 'rapp-' + Date.now(),
        number: num,
        richiestaNum: '',
        dittaEsecutrice: 'Rekeep SpA',
        cliente: client,
        via: '',
        civico: '',
        citta: '',
        edificio: '',
        piano: '',
        vano: '',
        tipologiaIntervento: [],
        causaIntervento: [],
        causaInterventoAltro: '',
        lavoriEseguiti: [],
        lavoriEseguitiAltro: '',
        descrizioneIntervento: '',
        operatori: [],
        materiali: [],
        anomalieDescrizione: '',
        anomalieAzioni: '',
        dataLavori: new Date().toISOString().split('T')[0],
        firmaEsecutore: '',
        referenteCliente: '',
        responsabile: '',
        status: 'draft',
        commessaId: commessaId
    };

    if (!state.rapporti) state.rapporti = [];
    state.rapporti.push(newRapp);
    saveState();

    document.getElementById('modal-add-rapporto').classList.remove('active');
    switchView('rapporti-edit', newRapp.id);
}


// Helper submitAddOreExtra
function submitAddOreExtra() {
    const name = document.getElementById('add-ore-name').value || 'Nuovo Registro Ore Extra';
    const commessaId = document.getElementById('add-ore-commessa').value;
    const client = document.getElementById('add-ore-client').value || 'RAI';
    const year = parseInt(document.getElementById('add-ore-year').value) || 2026;
    const quarter = parseInt(document.getElementById('add-ore-quarter').value) || 3;
    
    if (!commessaId) {
        alert('Selezionare una commessa.');
        return;
    }
    
    let monthsNames = [];
    if (quarter === 1) monthsNames = ['GENNAIO', 'FEBBRAIO', 'MARZO'];
    else if (quarter === 2) monthsNames = ['APRILE', 'MAGGIO', 'GIUGNO'];
    else if (quarter === 3) monthsNames = ['LUGLIO', 'AGOSTO', 'SETTEMBRE'];
    else if (quarter === 4) monthsNames = ['OTTOBRE', 'NOVEMBRE', 'DICEMBRE'];
    
    const newOreObj = {
        id: 'ore-' + Date.now(),
        commessaId: commessaId,
        name: name,
        committente: client,
        presidio: client === 'RAI' ? 'RAI MILANO SEMPIONE' : 'PRESIDIO GENERALE',
        areaIntervento: 'C.so Sempione 27 (MI)',
        odl: '',
        prevCode: '',
        date: new Date().toISOString().split('T')[0],
        companyName: 'DIREZIONE OPERATION - AREA LOMBARDIA',
        caPerson: state.settings.caPerson,
        caPerson2: state.settings.caPerson2,
        costoBase: 18.30,
        markupPercent: 26.50,
        discountPercent: 31.00,
        formulaType: 'originale',
        status: 'draft',
        months: monthsNames.map((mName, index) => {
            const monthIndex = (quarter - 1) * 3 + index;
            return {
                id: `ore-month-${mName.toLowerCase()}-${Date.now()}`,
                monthName: `${mName} ${year} consuntivo`,
                part1: [
                    { key: 'feriale_diurno', description: 'ORE FERIALI DIURNE AD INTEGRAZIONE (06:00-08:30)', oreGg: 2.5, giorni: 0, maggiorazione: 0 },
                    { key: 'feriale_notturno', description: 'Sovrapprezzo per lavoro notturno - ORE NOTTURNE FERIALI(00:30-06:00)', oreGg: 5.5, giorni: 0, maggiorazione: 0.3 },
                    { key: 'festivo', description: 'Sovrapprezzo per lavoro festivo - ORE FESTIVE', oreGg: 8.0, giorni: 0, maggiorazione: 0.5 }
                ],
                part2: []
            };
        })
    };
    
    state.oreExtra.push(newOreObj);
    saveState();
    document.getElementById('modal-add-oreExtra').classList.remove('active');
    switchView('oreExtra-edit', newOreObj.id);
}
