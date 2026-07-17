/**
 * Gestione Esportazione Excel (excel-export.js)
 * Utilizza la libreria ExcelJS caricata via CDN per creare file excel con formattazione e formule native.
 */

const ExcelExporter = {
    // Formati Contabilità
    fmtCurrency2: '_-* #,##0.00 €_-;\\-* #,##0.00 €_-;_-* "-"?? €_-;_-@_-',
    fmtCurrency4: '_-* #,##0.0000 €_-;\\-* #,##0.0000 €_-;_-* "-"?? €_-;_-@_-',
    fmtCurrency6: '_-* #,##0.000000 €_-;\\-* #,##0.000000 €_-;_-* "-"?? €_-;_-@_-',

    // Stili riutilizzabili
    greenFill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFCCFFCC' }
    },
    yellowFill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' }
    },
    thinBorder: {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
    },

    // Utility per formattare le celle
    formatHeaderCell(cell, text, options = {}) {
        cell.value = text;
        cell.font = Object.assign({
            name: 'Arial',
            size: 10,
            bold: true,
            color: { argb: 'FF000000' }
        }, options.font || {});

        if (options.fill) {
            cell.fill = options.fill;
        } else {
            cell.fill = undefined;
        }

        cell.alignment = Object.assign({
            vertical: 'middle',
            horizontal: 'center',
            wrapText: true
        }, options.alignment || {});

        cell.border = Object.assign({
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
        }, options.border || {});
    },

    formatDataCell(cell, value, options = {}) {
        cell.value = value;
        cell.font = Object.assign({
            name: 'Arial',
            size: 10,
            color: { argb: 'FF000000' }
        }, options.font || {});

        if (options.fill) {
            cell.fill = options.fill;
        } else {
            cell.fill = undefined;
        }

        cell.alignment = Object.assign({
            vertical: 'middle',
            horizontal: 'left'
        }, options.alignment || {});

        cell.border = Object.assign({
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
        }, options.border || {});

        if (options.numFormat) {
            cell.numFmt = options.numFormat;
        }
    },

    parseCell(cellStr) {
        const match = cellStr.match(/^([A-Z]+)([0-9]+)$/);
        if (!match) return { row: 1, col: 1 };
        const colStr = match[1];
        const row = parseInt(match[2], 10);
        let col = 0;
        for (let i = 0; i < colStr.length; i++) {
            col = col * 26 + (colStr.charCodeAt(i) - 64);
        }
        return { row, col };
    },

    parseRange(rangeStr) {
        const parts = rangeStr.split(':');
        const start = this.parseCell(parts[0]);
        const end = parts[1] ? this.parseCell(parts[1]) : start;
        return {
            startRow: start.row,
            startCol: start.col,
            endRow: end.row,
            endCol: end.col
        };
    },

    styleRange(ws, rangeStr, options = {}) {
        const { startRow, startCol, endRow, endCol } = this.parseRange(rangeStr);
        for (let r = startRow; r <= endRow; r++) {
            const row = ws.getRow(r);
            for (let c = startCol; c <= endCol; c++) {
                const cell = row.getCell(c);
                if (options.font) cell.font = Object.assign({}, cell.font, options.font);
                if (options.fill) cell.fill = options.fill;
                if (options.border) cell.border = options.border;
                if (options.alignment) cell.alignment = options.alignment;
                if (options.numFormat) cell.numFmt = options.numFormat;
            }
        }
    },

    autoFitColumnWidth(ws, colIndex, minWidth = 14) {
        try {
            const col = ws.getColumn(colIndex);
            let maxLen = minWidth;
            col.eachCell({ includeEmpty: false }, cell => {
                let val = cell.value;
                if (val !== null && val !== undefined) {
                    let text = '';
                    if (typeof val === 'object') {
                        if (val.result !== undefined && val.result !== null) {
                            text = val.result.toString();
                        } else if (val.formula) {
                            text = "123456.78"; // Generic format length estimate
                        } else if (val.richText) {
                            text = val.richText.map(t => t.text).join('');
                        } else {
                            text = val.toString();
                        }
                    } else if (val instanceof Date) {
                        text = '2026-06-29';
                    } else {
                        text = val.toString();
                    }

                    let len = text.length;
                    if (cell.numFmt) {
                        if (cell.numFmt.includes('0.000000')) len += 10;
                        else if (cell.numFmt.includes('0.0000')) len += 8;
                        else if (cell.numFmt.includes('0.00')) len += 6;
                    }
                    if (len > maxLen) {
                        maxLen = len;
                    }
                }
            });
            col.width = maxLen + 2;
        } catch (err) {
            console.error('Error in autoFitColumnWidth:', err);
        }
    },

    // Esportazione Preventivo
    async exportPreventivo(prev) {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Antigravity Gestione Preventivi';
        workbook.lastModifiedBy = 'Antigravity';
        workbook.created = new Date();
        workbook.modified = new Date();

        const sheetName = `Prev  ${prev.number || '00000'}`;
        const ws = workbook.addWorksheet(sheetName.substring(0, 31), {
            views: [{ showGridLines: true }],
            pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
        });

        // Impostazione larghezza colonne A-L
        ws.columns = [
            { width: 11.30 }, // A: Listino
            { width: 21.56 }, // B: Voci
            { width: 49.33 }, // C: Descrizione
            { width: 6.33 },  // D: U.M.
            { width: 12.67 }, // E: Q.tà
            { width: 20.44 }, // F: Prezzo unitario
            { width: 20.44 }, // G: Incr. 15% contrattuale
            { width: 20.44 }, // H: Sconto Gara 31%
            { width: 20.44 }, // I: PU Scontato
            { width: 20.44 }, // J: Totale
            { width: 11.11 }, // K: Spacing
            { width: 8.33 }   // L: Spacing
        ];

        // Righe di intestazione (Intestazione aziendale e metadati)
        ws.getRow(4).height = 13.5;
        ws.getCell('F4').value = 'Spett.le';
        ws.getCell('F4').font = { name: 'Arial', size: 11, bold: true };
        ws.getCell('F4').alignment = { horizontal: 'left', vertical: 'middle' };

        // Aggiunta Loghi
        try {
            const companyLogoB64 = (typeof state !== 'undefined' && state.settings && state.settings.companyLogo === 'cmf')
                ? (window.CMF_LOGO || (typeof CMF_LOGO !== 'undefined' ? CMF_LOGO : null))
                : (window.REKEEP_LOGO || (typeof REKEEP_LOGO !== 'undefined' ? REKEEP_LOGO : null));
            const raiLogoB64 = window.RAI_LOGO || (typeof RAI_LOGO !== 'undefined' ? RAI_LOGO : null);

            if (companyLogoB64) {
                const cleanB64 = companyLogoB64.split(',')[1] || companyLogoB64;
                const companyImageId = workbook.addImage({
                    base64: cleanB64,
                    extension: 'png',
                });
                ws.addImage(companyImageId, {
                    tl: { col: 2, row: 1 }, // Column C (index 2), Row 2 (index 1)
                    br: { col: 3, row: 6 }, // Column D (index 3), Row 7 (index 6) - escluso D e riga 7 (quindi copre C2:C6)
                    editAs: 'oneCell'
                });
            }

            if (raiLogoB64) {
                const cleanB64 = raiLogoB64.split(',')[1] || raiLogoB64;
                const raiImageId = workbook.addImage({
                    base64: cleanB64,
                    extension: 'jpeg',
                });
                ws.addImage(raiImageId, {
                    tl: { col: 6, row: 1 }, // Column G (index 6), Row 2 (index 1)
                    br: { col: 7, row: 6 }, // Column H (index 7), Row 7 (index 6) - escluso H e riga 7
                    editAs: 'oneCell'
                });
            }
        } catch (err) {
            console.error('[Preventivo Export] Errore aggiunta loghi Excel:', err);
        }

        ws.getRow(8).height = 15;
        ws.getRow(9).height = 15;
        ws.getRow(10).height = 15;
        ws.mergeCells('A8:D8');
        ws.getCell('A8').value = 'Sede Legale: Via Poli 4 - Zola Predosa (BO)';
        ws.getCell('A8').font = { name: 'Arial', size: 8 };
        ws.getCell('A8').alignment = { horizontal: 'left', vertical: 'middle' };

        ws.mergeCells('A9:D9');
        ws.getCell('A9').value = 'Filiale Lombardia - Sede di Milano';
        ws.getCell('A9').font = { name: 'Arial', size: 8 };
        ws.getCell('A9').alignment = { horizontal: 'left', vertical: 'middle' };

        ws.mergeCells('A10:D10');
        ws.getCell('A10').value = prev.companyName || 'DIREZIONE OPERATION - AREA LOMBARDIA';
        ws.getCell('A10').font = { name: 'Arial', size: 9, bold: true };
        ws.getCell('A10').alignment = { horizontal: 'left', vertical: 'middle' };

        ws.mergeCells('F8:F10');
        ws.getCell('F8').value = 'c.a:';
        ws.getCell('F8').font = { name: 'Arial', size: 10, bold: false };
        ws.getCell('F8').alignment = { horizontal: 'center', vertical: 'middle' };

        ws.mergeCells('G8:J8');
        const cellG8 = ws.getCell('G8');
        cellG8.value = prev.caPerson || 'Ripa Antonio';
        cellG8.font = { name: 'Arial', size: 16 };
        cellG8.alignment = { horizontal: 'left', vertical: 'middle' };

        ws.mergeCells('G9:J9');
        ws.getCell('G9').value = '';

        ws.mergeCells('G10:J10');
        const cellG10 = ws.getCell('G10');
        cellG10.value = prev.caPerson2 || 'Tassini Davide';
        cellG10.font = { name: 'Arial', size: 16 };
        cellG10.alignment = { horizontal: 'left', vertical: 'middle' };

        ws.getRow(12).height = 17;
        ws.getCell('A12').value = 'DATA:';
        ws.getCell('A12').font = { name: 'Arial', size: 10, bold: false };
        ws.getCell('A12').alignment = { horizontal: 'left', vertical: 'middle' };

        const dateVal = prev.date ? new Date(prev.date) : new Date();
        ws.getCell('B12').value = dateVal;
        ws.getCell('B12').numFmt = 'yyyy-mm-dd';
        ws.getCell('B12').font = { name: 'Arial', size: 11 };
        ws.getCell('B12').alignment = { horizontal: 'center', vertical: 'middle' };

        ws.getRow(13).height = 17;
        ws.getCell('A13').value = `COMMITTENTE: ${prev.committente || 'RAI'}`;
        ws.getCell('A13').font = { name: 'Arial', size: 9, bold: false };
        ws.getCell('A13').alignment = { horizontal: 'left', vertical: 'middle' };

        ws.getCell('E13').value = 'NUM. Offerta';
        ws.getCell('E13').font = { name: 'Arial', size: 9, bold: true };
        ws.getCell('E13').alignment = { horizontal: 'left', vertical: 'middle' };
        ws.getCell('E13').border = this.thinBorder;

        ws.mergeCells('F13:I13');
        this.styleRange(ws, 'F13:I13', {
            font: { name: 'Arial', size: 10, bold: true },
            alignment: { horizontal: 'center', vertical: 'middle' },
            border: this.thinBorder
        });
        ws.getCell('F13').value = prev.number || '';

        ws.getRow(14).height = 17;
        ws.getCell('A14').value = `PRESIDIO: ${prev.presidio || 'RAI MILANO'}`;
        ws.getCell('A14').font = { name: 'Arial', size: 9, bold: true };
        ws.getCell('A14').alignment = { horizontal: 'left', vertical: 'middle' };

        ws.getCell('E14').value = 'PREV.';
        ws.getCell('E14').font = { name: 'Arial', size: 9, bold: true };
        ws.getCell('E14').alignment = { horizontal: 'left', vertical: 'middle' };
        ws.getCell('E14').border = this.thinBorder;

        ws.mergeCells('F14:I14');
        this.styleRange(ws, 'F14:I14', {
            font: { name: 'Arial', size: 12, bold: true },
            alignment: { horizontal: 'center', vertical: 'middle' },
            border: this.thinBorder
        });
        ws.getCell('F14').value = prev.prevCode || 'REK/BD/BD/2026/U/ic/MP/000163';

        ws.getRow(15).height = 17;
        ws.getCell('A15').value = 'AREA LAVORO: ';
        ws.getCell('A15').font = { name: 'Arial', size: 9, bold: false };
        ws.getCell('A15').alignment = { horizontal: 'left', vertical: 'middle' };

        ws.getCell('C15').value = prev.areaLavoro || 'Palazzo 27 - Piano -2';
        ws.getCell('C15').font = { name: 'Century Gothic', size: 12 };
        ws.getCell('C15').alignment = { horizontal: 'center', vertical: 'bottom' };

        ws.getCell('E15').value = 'ODL:';
        ws.getCell('E15').font = { name: 'Arial', size: 9, bold: true };
        ws.getCell('E15').alignment = { horizontal: 'left', vertical: 'middle' };
        ws.getCell('E15').border = this.thinBorder;

        ws.mergeCells('F15:I15');
        this.styleRange(ws, 'F15:I15', {
            font: { name: 'Arial', size: 9, bold: true },
            alignment: { horizontal: 'center', vertical: 'middle' },
            border: this.thinBorder
        });
        ws.getCell('F15').value = prev.odl || '';

        ws.getRow(16).height = 17;
        ws.getCell('A16').value = `AREA INTERVENTO: ${prev.areaIntervento || 'C.so Sempione 27 (MI)'}`;
        ws.getCell('A16').font = { name: 'Arial', size: 9, bold: false };
        ws.getCell('A16').alignment = { horizontal: 'left', vertical: 'middle' };

        ws.mergeCells('E16:I16');
        this.styleRange(ws, 'E16:I16', {
            font: { name: 'Arial', size: 10, bold: true },
            alignment: { horizontal: 'center', vertical: 'middle' },
            border: this.thinBorder
        });
        ws.getCell('E16').value = prev.extraCanoneText || 'MANUTENZIONE  EXTRA CANONE';

        // Oggetto (A18:J18 merged)
        ws.getRow(18).height = 39.8;
        ws.mergeCells('A18:J18');
        this.styleRange(ws, 'A18:J18', {
            font: { name: 'Arial', size: 12, bold: true },
            alignment: { horizontal: 'center', vertical: 'middle' },
            border: this.thinBorder
        });
        ws.getCell('A18').value = `Oggetto: ${prev.oggetto || ''}`;

        // COMPUTO METRICO (A19:I19 merged + J19)
        ws.getRow(19).height = 31.5;
        ws.mergeCells('A19:I19');
        this.styleRange(ws, 'A19:I19', {
            font: { name: 'Arial', size: 12, bold: true },
            alignment: { horizontal: 'center', vertical: 'middle' },
            fill: this.greenFill,
            border: this.thinBorder
        });
        ws.getCell('A19').value = 'COMPUTO  METRICO  ESTIMATIVO';

        this.styleRange(ws, 'J19:J19', {
            font: { name: 'Arial', size: 12, bold: true },
            alignment: { horizontal: 'center', vertical: 'middle' },
            fill: this.greenFill,
            border: this.thinBorder
        });
        ws.getCell('J19').value = 'IMPORTO';

        // Intestazioni Tabella Voci (Riga 20)
        const headerRow = ws.getRow(20);
        headerRow.height = 31.5;
        this.formatHeaderCell(ws.getCell('A20'), 'Listino');
        this.formatHeaderCell(ws.getCell('B20'), 'Voci');
        this.formatHeaderCell(ws.getCell('C20'), 'Descrizione sintetica delle lavorazioni');
        this.formatHeaderCell(ws.getCell('D20'), 'U.M.');
        this.formatHeaderCell(ws.getCell('E20'), 'Q.tà');
        this.formatHeaderCell(ws.getCell('F20'), 'Prezzo unitario');
        this.formatHeaderCell(ws.getCell('G20'), `Incr. ${(prev.markupPercent || 15)}% contr.`);
        this.formatHeaderCell(ws.getCell('H20'), `Sconto Gara ${(prev.discountPercent || 31)}%`);
        this.formatHeaderCell(ws.getCell('I20'), 'PU Scontato');
        this.formatHeaderCell(ws.getCell('J20'), 'Totale       ');

        let currentRow = 21;
        const items = prev.items || [];
        const materialiItems = items.filter(it => it.type !== 'manodopera');
        let manodoperaItems = items.filter(it => it.type === 'manodopera');

        // Se non ci sono voci di manodopera, aggiungiamo una riga vuota di default
        // per replicare la struttura del modello originale
        if (manodoperaItems.length === 0) {
            manodoperaItems = [{
                listino: '',
                voci: '',
                descrizione: '',
                um: 'ore',
                qty: 0,
                price: 0,
                type: 'manodopera'
            }];
        }

        const markup = (prev.markupPercent !== undefined ? prev.markupPercent : 15) / 100;
        const discount = (prev.discountPercent !== undefined ? prev.discountPercent : 31) / 100;

        // 1. MATERIALI
        const startMaterialiRow = currentRow;
        materialiItems.forEach(item => {
            const row = ws.getRow(currentRow);
            row.height = 89.4; // Altezza riga per voci del preventivo originale!

            this.formatDataCell(ws.getCell(`A${currentRow}`), item.listino || '', { font: { size: 8 }, alignment: { horizontal: 'center', wrapText: true } });
            this.formatDataCell(ws.getCell(`B${currentRow}`), item.voci || 'N.P.', { font: { size: 14 }, alignment: { horizontal: 'center' } });
            this.formatDataCell(ws.getCell(`C${currentRow}`), item.descrizione || '', { font: { size: 14, name: 'Aptos' }, alignment: { wrapText: true } });
            this.formatDataCell(ws.getCell(`D${currentRow}`), item.um || 'cad', { font: { size: 14 }, alignment: { horizontal: 'center' } });
            this.formatDataCell(ws.getCell(`E${currentRow}`), Number(item.qty) || 0, { font: { size: 14 }, alignment: { horizontal: 'center' }, numFormat: '#,##0' });
            this.formatDataCell(ws.getCell(`F${currentRow}`), Number(item.price) || 0, { font: { size: 14 }, alignment: { horizontal: 'center' }, numFormat: ExcelExporter.fmtCurrency2 });

            const cellG = ws.getCell(`G${currentRow}`);
            const cellH = ws.getCell(`H${currentRow}`);
            const cellI = ws.getCell(`I${currentRow}`);
            const cellJ = ws.getCell(`J${currentRow}`);

            const isMaggiorata = item.maggiorata !== false;
            const fType = prev.formulaType || 'corretta';

            if (isMaggiorata) {
                if (fType === 'originale') {
                    cellG.value = { formula: `=F${currentRow}*${markup}`, result: (Number(item.price) || 0) * markup };
                    cellH.value = { formula: `=-G${currentRow}*(1-${discount})`, result: - ((Number(item.price) || 0) * markup) * (1 - discount) };
                    cellI.value = { formula: `=F${currentRow}+G${currentRow}+H${currentRow}`, result: (Number(item.price) || 0) + ((Number(item.price) || 0) * markup) - (((Number(item.price) || 0) * markup) * (1 - discount)) };
                    cellJ.value = { formula: `=E${currentRow}*I${currentRow}`, result: (Number(item.qty) || 0) * ((Number(item.price) || 0) + ((Number(item.price) || 0) * markup) - (((Number(item.price) || 0) * markup) * (1 - discount))) };
                } else {
                    cellG.value = { formula: `=F${currentRow}*${markup}`, result: (Number(item.price) || 0) * markup };
                    cellH.value = { formula: `=-(F${currentRow}+G${currentRow})*${discount}`, result: - ((Number(item.price) || 0) + ((Number(item.price) || 0) * markup)) * discount };
                    cellI.value = { formula: `=F${currentRow}+G${currentRow}+H${currentRow}`, result: ((Number(item.price) || 0) + ((Number(item.price) || 0) * markup)) * (1 - discount) };
                    cellJ.value = { formula: `=E${currentRow}*I${currentRow}`, result: (Number(item.qty) || 0) * ((Number(item.price) || 0) + ((Number(item.price) || 0) * markup)) * (1 - discount) };
                }
            } else {
                cellG.value = { formula: `=0`, result: 0 };
                cellH.value = { formula: `=-F${currentRow}*${discount}`, result: - (Number(item.price) || 0) * discount };
                cellI.value = { formula: `=F${currentRow}+G${currentRow}+H${currentRow}`, result: (Number(item.price) || 0) * (1 - discount) };
                cellJ.value = { formula: `=E${currentRow}*I${currentRow}`, result: (Number(item.qty) || 0) * (Number(item.price) || 0) * (1 - discount) };
            }

            this.formatDataCell(cellG, cellG.value, { font: { size: 14 }, alignment: { horizontal: 'center' }, numFormat: ExcelExporter.fmtCurrency4 });
            this.formatDataCell(cellH, cellH.value, { font: { size: 14 }, alignment: { horizontal: 'right' }, numFormat: ExcelExporter.fmtCurrency4 });
            this.formatDataCell(cellI, cellI.value, { font: { size: 14 }, alignment: { horizontal: 'right' }, numFormat: ExcelExporter.fmtCurrency6 });
            this.formatDataCell(cellJ, cellJ.value, { font: { size: 14 }, alignment: { horizontal: 'right' }, numFormat: ExcelExporter.fmtCurrency2 });

            currentRow++;
        });
        const endMaterialiRow = currentRow - 1;

        // Riga Totale Materiali
        const totalMatRowIndex = currentRow;
        const totalMatRow = ws.getRow(totalMatRowIndex);
        totalMatRow.height = 21;

        ws.mergeCells(`A${totalMatRowIndex}:I${totalMatRowIndex}`);
        this.styleRange(ws, `A${totalMatRowIndex}:I${totalMatRowIndex}`, {
            font: { name: 'Arial', size: 10, bold: true },
            alignment: { horizontal: 'right', vertical: 'middle' },
            fill: this.greenFill,
            border: this.thinBorder
        });
        ws.getCell(`A${totalMatRowIndex}`).value = 'TOTALE MATERIALI';

        this.styleRange(ws, `J${totalMatRowIndex}:J${totalMatRowIndex}`, {
            font: { name: 'Arial', size: 16, bold: true },
            alignment: { horizontal: 'center', vertical: 'middle' },
            fill: this.greenFill,
            border: this.thinBorder,
            numFormat: ExcelExporter.fmtCurrency2
        });
        const totalMatValueCell = ws.getCell(`J${totalMatRowIndex}`);
        if (materialiItems.length > 0) {
            totalMatValueCell.value = { formula: `=SUM(J${startMaterialiRow}:J${endMaterialiRow})` };
        } else {
            totalMatValueCell.value = 0;
        }

        currentRow++; // Manodopera inizia subito alla riga successiva

        // 2. MANODOPERA
        const startManoRow = currentRow;
        manodoperaItems.forEach(item => {
            const row = ws.getRow(currentRow);
            row.height = 89.4; // stessa altezza riga

            this.formatDataCell(ws.getCell(`A${currentRow}`), item.listino || '', { font: { size: 8 }, alignment: { horizontal: 'center', wrapText: true } });
            this.formatDataCell(ws.getCell(`B${currentRow}`), item.voci || 'N.P.', { font: { size: 14 }, alignment: { horizontal: 'center' } });
            this.formatDataCell(ws.getCell(`C${currentRow}`), item.descrizione || '', { font: { size: 14, name: 'Aptos' }, alignment: { wrapText: true } });
            this.formatDataCell(ws.getCell(`D${currentRow}`), item.um || 'ore', { font: { size: 14 }, alignment: { horizontal: 'center' } });
            this.formatDataCell(ws.getCell(`E${currentRow}`), Number(item.qty) || 0, { font: { size: 14 }, alignment: { horizontal: 'center' }, numFormat: '#,##0.0' });
            this.formatDataCell(ws.getCell(`F${currentRow}`), Number(item.price) || 0, { font: { size: 14 }, alignment: { horizontal: 'center' }, numFormat: ExcelExporter.fmtCurrency2 });

            const cellG = ws.getCell(`G${currentRow}`);
            const cellH = ws.getCell(`H${currentRow}`);
            const cellI = ws.getCell(`I${currentRow}`);
            const cellJ = ws.getCell(`J${currentRow}`);

            const isMaggiorata = item.maggiorata !== false;
            const fType = prev.formulaType || 'corretta';

            if (isMaggiorata) {
                if (fType === 'originale') {
                    cellG.value = { formula: `=F${currentRow}*${markup}`, result: (Number(item.price) || 0) * markup };
                    cellH.value = { formula: `=-G${currentRow}*(1-${discount})`, result: - ((Number(item.price) || 0) * markup) * (1 - discount) };
                    cellI.value = { formula: `=F${currentRow}+G${currentRow}+H${currentRow}`, result: (Number(item.price) || 0) + ((Number(item.price) || 0) * markup) - (((Number(item.price) || 0) * markup) * (1 - discount)) };
                    cellJ.value = { formula: `=E${currentRow}*I${currentRow}`, result: (Number(item.qty) || 0) * ((Number(item.price) || 0) + ((Number(item.price) || 0) * markup) - (((Number(item.price) || 0) * markup) * (1 - discount))) };
                } else {
                    cellG.value = { formula: `=F${currentRow}*${markup}`, result: (Number(item.price) || 0) * markup };
                    cellH.value = { formula: `=-(F${currentRow}+G${currentRow})*${discount}`, result: - ((Number(item.price) || 0) + ((Number(item.price) || 0) * markup)) * discount };
                    cellI.value = { formula: `=F${currentRow}+G${currentRow}+H${currentRow}`, result: ((Number(item.price) || 0) + ((Number(item.price) || 0) * markup)) * (1 - discount) };
                    cellJ.value = { formula: `=E${currentRow}*I${currentRow}`, result: (Number(item.qty) || 0) * ((Number(item.price) || 0) + ((Number(item.price) || 0) * markup)) * (1 - discount) };
                }
            } else {
                cellG.value = { formula: `=0`, result: 0 };
                cellH.value = { formula: `=-F${currentRow}*${discount}`, result: - (Number(item.price) || 0) * discount };
                cellI.value = { formula: `=F${currentRow}+G${currentRow}+H${currentRow}`, result: (Number(item.price) || 0) * (1 - discount) };
                cellJ.value = { formula: `=E${currentRow}*I${currentRow}`, result: (Number(item.qty) || 0) * (Number(item.price) || 0) * (1 - discount) };
            }

            this.formatDataCell(cellG, cellG.value, { font: { size: 14 }, alignment: { horizontal: 'center' }, numFormat: ExcelExporter.fmtCurrency4 });
            this.formatDataCell(cellH, cellH.value, { font: { size: 14 }, alignment: { horizontal: 'right' }, numFormat: ExcelExporter.fmtCurrency4 });
            this.formatDataCell(cellI, cellI.value, { font: { size: 14 }, alignment: { horizontal: 'right' }, numFormat: ExcelExporter.fmtCurrency6 });
            this.formatDataCell(cellJ, cellJ.value, { font: { size: 14 }, alignment: { horizontal: 'right' }, numFormat: ExcelExporter.fmtCurrency2 });

            currentRow++;
        });
        const endManoRow = currentRow - 1;

        // Riga Totale Manodopera
        const totalManoRowIndex = currentRow;
        const totalManoRow = ws.getRow(totalManoRowIndex);
        totalManoRow.height = 16.2;

        ws.mergeCells(`A${totalManoRowIndex}:I${totalManoRowIndex}`);
        this.styleRange(ws, `A${totalManoRowIndex}:I${totalManoRowIndex}`, {
            font: { name: 'Arial', size: 10, bold: true },
            alignment: { horizontal: 'right', vertical: 'middle' },
            fill: this.greenFill,
            border: this.thinBorder
        });
        ws.getCell(`A${totalManoRowIndex}`).value = ' TOTALE MANODOPERA';

        this.styleRange(ws, `J${totalManoRowIndex}:J${totalManoRowIndex}`, {
            font: { name: 'Arial', size: 10, bold: true },
            alignment: { horizontal: 'center', vertical: 'middle' },
            fill: this.greenFill,
            border: this.thinBorder,
            numFormat: ExcelExporter.fmtCurrency2
        });
        const totalManoValueCell = ws.getCell(`J${totalManoRowIndex}`);
        totalManoValueCell.value = { formula: `=SUM(J${startManoRow}:J${endManoRow})` };

        currentRow += 2; // Riga vuota prima del Totale Offerta Generale

        // 3. TOTALE OFFERTA GENERALE
        const finalTotalRowIndex = currentRow;
        const finalTotalRow = ws.getRow(finalTotalRowIndex);
        finalTotalRow.height = 30;

        ws.mergeCells(`A${finalTotalRowIndex}:I${finalTotalRowIndex}`);
        this.styleRange(ws, `A${finalTotalRowIndex}:I${finalTotalRowIndex}`, {
            font: { name: 'Arial', size: 12, bold: true },
            alignment: { horizontal: 'center', vertical: 'middle' },
            fill: this.greenFill,
            border: this.thinBorder
        });
        ws.getCell(`A${finalTotalRowIndex}`).value = 'TOTALE  OFFERTA (IVA escl.)';

        this.styleRange(ws, `J${finalTotalRowIndex}:J${finalTotalRowIndex}`, {
            font: { name: 'Arial', size: 16, bold: true },
            alignment: { horizontal: 'center', vertical: 'middle' },
            fill: this.greenFill,
            border: this.thinBorder,
            numFormat: ExcelExporter.fmtCurrency2
        });
        const finalValCell = ws.getCell(`J${finalTotalRowIndex}`);
        finalValCell.value = { formula: `=+J${totalManoRowIndex}+J${totalMatRowIndex}` };

        // Firme e Condizioni
        currentRow += 2;
        ws.getRow(currentRow).height = 13.2;
        ws.mergeCells(`A${currentRow}:E${currentRow}`);
        this.styleRange(ws, `A${currentRow}:E${currentRow}`, {
            font: { name: 'Arial', size: 12, bold: true },
            alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
            border: this.thinBorder
        });
        ws.getCell(`A${currentRow}`).value = `Per REKEEP\n${prev.author || 'Ivan Luca Campagnoli'}`;

        ws.mergeCells(`F${currentRow}:J${currentRow}`);
        this.styleRange(ws, `F${currentRow}:J${currentRow}`, {
            font: { name: 'Arial', size: 12, bold: true },
            alignment: { horizontal: 'center', vertical: 'top', wrapText: true },
            border: this.thinBorder
        });
        ws.getCell(`F${currentRow}`).value = 'Firma per accettazione';

        currentRow += 2;
        ws.getRow(currentRow).height = 13.2;
        ws.mergeCells(`A${currentRow}:E${currentRow}`);
        this.styleRange(ws, `A${currentRow}:E${currentRow}`, {
            font: { name: 'Arial', size: 12, bold: true },
            alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
            border: this.thinBorder
        });
        ws.getCell(`A${currentRow}`).value = `Referenti RAI\n   ${prev.caPerson2 || 'Davide Tassini'} - ${prev.caPerson || 'Ripa Antonio'}`;

        currentRow += 4;
        ws.getRow(currentRow).height = 15.6;
        ws.getCell(`A${currentRow}`).value = 'Note';
        ws.getCell(`A${currentRow}`).font = { name: 'Arial', size: 10, bold: true };
        ws.getCell(`A${currentRow}`).alignment = { horizontal: 'left', vertical: 'middle' };

        currentRow++;
        ws.mergeCells(`A${currentRow}:J${currentRow}`);
        this.styleRange(ws, `A${currentRow}:J${currentRow}`, {
            font: { name: 'Arial', size: 9 },
            alignment: { horizontal: 'left', vertical: 'middle', wrapText: true }
        });
        ws.getCell(`A${currentRow}`).value = prev.notes || '';

        currentRow += 2;
        ws.getRow(currentRow).height = 15;
        ws.mergeCells(`A${currentRow}:J${currentRow}`);
        this.styleRange(ws, `A${currentRow}:J${currentRow}`, {
            font: { name: 'Arial', size: 12 },
            alignment: { horizontal: 'center', vertical: 'middle' },
            fill: this.greenFill,
            border: this.thinBorder
        });
        ws.getCell(`A${currentRow}`).value = 'CONDIZIONI  DELLA  FORNITURA';

        const cond = prev.conditions || {};
        const condFields = [
            { label: 'Pagamenti', val: cond.pagamenti || 'Termini contrattuali' },
            { label: 'Esclusione ', val: cond.esclusione || 'Tutto quanto non descritto' },
            { label: 'Validità dell\'offerta', val: cond.validita || '30 giorni' },
            { label: 'Consegna lavori', val: cond.consegna || '30 giorni data ordine' }
        ];

        condFields.forEach((cf, idx) => {
            const rIdx = currentRow + 1 + idx;
            ws.getRow(rIdx).height = 14;

            ws.mergeCells(`A${rIdx}:E${rIdx}`);
            this.styleRange(ws, `A${rIdx}:E${rIdx}`, {
                font: { name: 'Arial', size: 10 },
                alignment: { horizontal: 'left', vertical: 'middle' },
                border: this.thinBorder
            });
            ws.getCell(`A${rIdx}`).value = cf.label;

            ws.mergeCells(`F${rIdx}:J${rIdx}`);
            this.styleRange(ws, `F${rIdx}:J${rIdx}`, {
                font: { name: 'Arial', size: 10 },
                alignment: { horizontal: 'left', vertical: 'middle' },
                border: this.thinBorder
            });
            ws.getCell(`F${rIdx}`).value = cf.val;
        });

        currentRow += 6;
        ws.getRow(currentRow).height = 13.2;
        ws.mergeCells(`A${currentRow}:J${currentRow}`);
        this.styleRange(ws, `A${currentRow}:J${currentRow}`, {
            font: { name: 'Arial', size: 12, bold: true },
            alignment: { horizontal: 'center', vertical: 'top' },
            border: this.thinBorder
        });
        ws.getCell(`A${currentRow}`).value = 'PER RICEVUTA';



        // Salvataggio tramite FileSaver
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `PREVENTIVO-${prev.number || 'OFFERTA'}-${(prev.oggetto || 'LAVORI').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)}.xlsx`);
    },


    // Esportazione Consuntivo (multi-foglio)
    async exportConsuntivo(cons) {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Antigravity Gestione Consuntivi';
        workbook.lastModifiedBy = 'Antigravity';
        workbook.created = new Date();
        workbook.modified = new Date();

        const months = cons.months || [];
        const markup = (cons.markupPercent !== undefined ? cons.markupPercent : 15) / 100;
        const discount = (cons.discountPercent !== undefined ? cons.discountPercent : 31) / 100;

        // =====================================================
        // Helper: Crea intestazione comune per ogni foglio del consuntivo
        // =====================================================
        const buildConsuntivoHeader = (ws, oggettoText, consDateValue, consValue = '') => {
            // Aggiunta Loghi
            try {
                const companyLogoB64 = (typeof state !== 'undefined' && state.settings && state.settings.companyLogo === 'cmf')
                    ? (window.CMF_LOGO || (typeof CMF_LOGO !== 'undefined' ? CMF_LOGO : null))
                    : (window.REKEEP_LOGO || (typeof REKEEP_LOGO !== 'undefined' ? REKEEP_LOGO : null));
                const raiLogoB64 = window.RAI_LOGO || (typeof RAI_LOGO !== 'undefined' ? RAI_LOGO : null);

                if (companyLogoB64) {
                    const cleanB64 = companyLogoB64.split(',')[1] || companyLogoB64;
                    const companyImageId = workbook.addImage({
                        base64: cleanB64,
                        extension: 'png',
                    });
                    ws.addImage(companyImageId, {
                        tl: { col: 2, row: 1 }, // Column C (index 2), Row 2 (index 1)
                        br: { col: 3, row: 6 }, // Column D (index 3), Row 7 (index 6) - escluso D e riga 7 (quindi copre C2:C6)
                        editAs: 'oneCell'
                    });
                }

                if (raiLogoB64) {
                    const cleanB64 = raiLogoB64.split(',')[1] || raiLogoB64;
                    const raiImageId = workbook.addImage({
                        base64: cleanB64,
                        extension: 'jpeg',
                    });
                    ws.addImage(raiImageId, {
                        tl: { col: 6, row: 1 }, // Column G (index 6), Row 2 (index 1)
                        br: { col: 7, row: 6 }, // Column H (index 7), Row 7 (index 6) - escluso H e riga 7
                        editAs: 'oneCell'
                    });
                }
            } catch (err) {
                console.error('[Consuntivo Header] Errore aggiunta loghi Excel:', err);
            }

            // Riga 4 - Spett.le
            ws.getRow(4).height = 13.5;
            ws.getCell('F4').value = 'Spett.le';
            ws.getCell('F4').font = { name: 'Arial', size: 11, bold: true };
            ws.getCell('F4').alignment = { horizontal: 'left', vertical: 'middle' };

            // Riga 8, 9 e 10 - Company + c.a. + nomi
            ws.getRow(8).height = 15;
            ws.getRow(9).height = 15;
            ws.getRow(10).height = 15;

            ws.mergeCells('B8:D8');
            ws.getCell('B8').value = 'Sede Legale: Via Poli 4 - Zola Predosa (BO)';
            ws.getCell('B8').font = { name: 'Arial', size: 8 };
            ws.getCell('B8').alignment = { horizontal: 'left', vertical: 'middle' };

            ws.mergeCells('B9:D9');
            ws.getCell('B9').value = 'Filiale Lombardia - Sede di Milano';
            ws.getCell('B9').font = { name: 'Arial', size: 8 };
            ws.getCell('B9').alignment = { horizontal: 'left', vertical: 'middle' };

            ws.mergeCells('B10:D10');
            ws.getCell('B10').value = cons.companyName || 'DIREZIONE OPERATION - AREA LOMBARDIA';
            ws.getCell('B10').font = { name: 'Arial', size: 9, bold: true };
            ws.getCell('B10').alignment = { horizontal: 'left', vertical: 'middle' };

            ws.mergeCells('F8:F10');
            ws.getCell('F8').value = 'c.a:';
            ws.getCell('F8').font = { name: 'Arial', size: 12 };
            ws.getCell('F8').alignment = { horizontal: 'center', vertical: 'middle' };

            ws.mergeCells('G8:J8');
            ws.getCell('G8').value = cons.caPerson || 'RIPA ANTONIO';
            ws.getCell('G8').font = { name: 'Arial', size: 12 };
            ws.getCell('G8').alignment = { horizontal: 'left', vertical: 'middle' };

            ws.mergeCells('G9:J9');
            ws.getCell('G9').value = '';

            ws.mergeCells('G10:J10');
            ws.getCell('G10').value = cons.caPerson2 || 'TASSINI DAVIDE';
            ws.getCell('G10').font = { name: 'Arial', size: 12 };
            ws.getCell('G10').alignment = { horizontal: 'left', vertical: 'middle' };

            // Riga 12 - DATA
            ws.getRow(12).height = 17;
            ws.getCell('B12').value = 'DATA:';
            ws.getCell('B12').font = { name: 'Arial', size: 10 };
            ws.getCell('B12').alignment = { horizontal: 'left', vertical: 'middle' };

            ws.getCell('C12').value = consDateValue;
            ws.getCell('C12').numFmt = 'yyyy-mm-dd';
            ws.getCell('C12').font = { name: 'Arial', size: 11 };
            ws.getCell('C12').alignment = { horizontal: 'center', vertical: 'middle' };

            // Riga 13 - Committente + NUM. Offerta
            ws.getRow(13).height = 17;
            ws.getCell('B13').value = `COMMITTENTE: ${cons.committente || 'RAI'}`;
            ws.getCell('B13').font = { name: 'Arial', size: 9, bold: false };
            ws.getCell('B13').alignment = { horizontal: 'left', vertical: 'middle' };

            ws.getCell('F13').value = 'CONS.';
            ws.getCell('F13').font = { name: 'Arial', size: 9, bold: true };
            ws.getCell('F13').alignment = { horizontal: 'left', vertical: 'middle' };
            ws.getCell('F13').border = this.thinBorder;

            ws.mergeCells('G13:J13');
            this.styleRange(ws, 'G13:J13', {
                font: { name: 'Arial', size: 10, bold: true },
                alignment: { horizontal: 'center', vertical: 'middle' },
                border: this.thinBorder
            });
            ws.getCell('G13').value = consValue || '';

            // Riga 14 - Presidio + PREV.
            ws.getRow(14).height = 17;
            ws.getCell('B14').value = `PRESIDIO: ${cons.presidio || 'RAI MILANO'}`;
            ws.getCell('B14').font = { name: 'Arial', size: 9, bold: true };
            ws.getCell('B14').alignment = { horizontal: 'left', vertical: 'middle' };

            ws.getCell('F14').value = 'PREV.';
            ws.getCell('F14').font = { name: 'Arial', size: 9, bold: true };
            ws.getCell('F14').alignment = { horizontal: 'left', vertical: 'middle' };
            ws.getCell('F14').border = this.thinBorder;

            ws.mergeCells('G14:J14');
            this.styleRange(ws, 'G14:J14', {
                font: { name: 'Arial', size: 12, bold: true },
                alignment: { horizontal: 'center', vertical: 'middle' },
                border: this.thinBorder
            });
            ws.getCell('G14').value = cons.prevCode || '';

            // Riga 15 - Area Lavoro + ODL:
            ws.getRow(15).height = 17;
            ws.getCell('B15').value = 'AREA LAVORO: ';
            ws.getCell('B15').font = { name: 'Arial', size: 9, bold: false };
            ws.getCell('B15').alignment = { horizontal: 'left', vertical: 'middle' };

            ws.getCell('D15').value = cons.areaLavoro || '';
            ws.getCell('D15').font = { name: 'Century Gothic', size: 12 };
            ws.getCell('D15').alignment = { horizontal: 'center', vertical: 'bottom' };

            ws.getCell('F15').value = 'ODL:';
            ws.getCell('F15').font = { name: 'Arial', size: 9, bold: true };
            ws.getCell('F15').alignment = { horizontal: 'left', vertical: 'middle' };
            ws.getCell('F15').border = this.thinBorder;

            ws.mergeCells('G15:J15');
            this.styleRange(ws, 'G15:J15', {
                font: { name: 'Arial', size: 9, bold: true },
                alignment: { horizontal: 'center', vertical: 'middle' },
                border: this.thinBorder
            });
            ws.getCell('G15').value = cons.odl || '';

            // Riga 16 - Area Intervento + MANUTENZIONE EXTRA CANONE
            ws.getRow(16).height = 17;
            ws.getCell('B16').value = `AREA INTERVENTO: ${cons.areaIntervento || 'C.so Sempione 27 (MI)'}`;
            ws.getCell('B16').font = { name: 'Arial', size: 9, bold: false };
            ws.getCell('B16').alignment = { horizontal: 'left', vertical: 'middle' };

            ws.mergeCells('F16:J16');
            this.styleRange(ws, 'F16:J16', {
                font: { name: 'Arial', size: 10, bold: true },
                alignment: { horizontal: 'center', vertical: 'middle' },
                border: this.thinBorder
            });
            ws.getCell('F16').value = cons.extraCanoneText || 'MANUTENZIONE  EXTRA CANONE';

            // Riga 18 - Oggetto (B18:K18 merged)
            ws.getRow(18).height = 39.8;
            ws.mergeCells('B18:K18');
            this.styleRange(ws, 'B18:K18', {
                font: { name: 'Arial', size: 12, bold: true },
                alignment: { horizontal: 'center', vertical: 'middle' },
                border: this.thinBorder
            });
            ws.getCell('B18').value = oggettoText;

            // Riga 19 - COMPUTO METRICO (B19:J19) + IMPORTO (K19)
            ws.getRow(19).height = 31.5;
            ws.mergeCells('B19:J19');
            ws.getCell('B19').value = 'COMPUTO  METRICO  ESTIMATIVO';
            ws.getCell('B19').font = { name: 'Arial', size: 12, bold: true };
            ws.getCell('B19').alignment = { horizontal: 'center', vertical: 'middle' };
            this.styleRange(ws, 'B19:J19', { border: this.thinBorder });

            ws.getCell('K19').value = 'IMPORTO';
            ws.getCell('K19').font = { name: 'Arial', size: 10, bold: true };
            ws.getCell('K19').alignment = { horizontal: 'center', vertical: 'middle' };
            ws.getCell('K19').border = this.thinBorder;
        };

        // =====================================================
        // 1. Genera i FOGLI MENSILI prima, per poterli referenziare nel riepilogo
        // =====================================================
        // Teniamo traccia delle posizioni dei totali per i link dal riepilogo
        const monthSheetInfo = []; // { sheetName, reports: [{ reportId, totalCellRef }] }

        months.forEach(month => {
            const sheetName = (month.monthName || 'MESE').substring(0, 31);
            const ws = workbook.addWorksheet(sheetName, {
                views: [{ showGridLines: true }],
                pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
            });

            // Larghezza colonne A-O (da ispezione originale)
            ws.columns = [
                { width: 8.33 },  // A: spacing
                { width: 11.30 }, // B: Listino
                { width: 37.22 }, // C: Voci
                { width: 53.22 }, // D: Descrizione
                { width: 6.67 },  // E: U.M.
                { width: 14.67 }, // F: Q.tà
                { width: 20.44 }, // G: Prezzo Unitario
                { width: 20.44 }, // H: Incr. %
                { width: 20.44 }, // I: Sconto Gara
                { width: 20.44 }, // J: PU Scontato
                { width: 20.44 }, // K: Totale
                { width: 8.33 },  // L: spacing
                { width: 8.33 },  // M: aux
                { width: 11.89 }, // N: aux
                { width: 8.33 }   // O: aux
            ];

            // Estrai nome del mese dal monthName (es. "APRILE NP 2026" -> "APRILE")
            const monthWord = (month.monthName || 'MESE').split(' ')[0];
            const yearPart = (month.monthName || '').match(/\d{4}/);
            const year = yearPart ? yearPart[0] : '2026';

            const monthDateValue = cons.date ? new Date(cons.date) : new Date();

            // Intestazione comune
            buildConsuntivoHeader(ws,
                `OGGETTO: CONSUNTIVO LAVORAZIONI EXTRA CANONE ${monthWord} ${year}`,
                monthDateValue,
                monthWord.toLowerCase()
            );

            // ---- Rapporti di lavoro ----
            let currentRow = 21;
            const reports = month.workReports || [];
            const reportTotalCells = []; // per il totale complessivo mensile

            reports.forEach((report, repIdx) => {
                const reportItems = report.items || [];

                // Riga gialla separatrice (RAPPORTO DI LAVORO N°: ...)
                const yellowRow = currentRow;
                ws.getRow(yellowRow).height = 36.8;
                ws.mergeCells(`B${yellowRow}:K${yellowRow}`);
                ws.getCell(`B${yellowRow}`).value = `RAPPORTO DI LAVORO N°: ${report.reportId || ''}`;
                ws.getCell(`B${yellowRow}`).font = { name: 'Arial', size: 26, bold: true };
                ws.getCell(`B${yellowRow}`).alignment = { horizontal: 'center', vertical: 'middle' };
                this.styleRange(ws, `B${yellowRow}:K${yellowRow}`, {
                    fill: this.yellowFill,
                    border: this.thinBorder
                });
                currentRow++;

                // Intestazioni tabella voci
                const headerRow = currentRow;
                ws.getRow(headerRow).height = 31.5;

                const headers = [
                    { col: 'B', text: 'Listino', width: null },
                    { col: 'C', text: 'Voci' },
                    { col: 'D', text: 'Descrizione sintetica delle lavorazioni' },
                    { col: 'E', text: 'U.M.' },
                    { col: 'F', text: 'Q.tà' },
                    { col: 'G', text: 'Prezzo unitario' },
                    { col: 'H', text: `Incr. ${cons.markupPercent || 15}% contr.` },
                    { col: 'I', text: `Sconto Gara ${cons.discountPercent || 31}%` },
                    { col: 'J', text: 'PU Scontato' },
                    { col: 'K', text: 'Totale' }
                ];

                headers.forEach(h => {
                    this.formatHeaderCell(ws.getCell(`${h.col}${headerRow}`), h.text, {
                        font: { name: 'Arial', size: 10, bold: true }
                    });
                });



                currentRow++;

                // Righe delle voci
                const startItemRow = currentRow;
                if (reportItems.length === 0) {
                    // Riga vuota placeholder
                    ws.getRow(currentRow).height = 164.3;
                    for (const col of ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']) {
                        const cell = ws.getCell(`${col}${currentRow}`);
                        cell.border = this.thinBorder;
                        cell.font = { name: 'Arial', size: 16 };
                        cell.alignment = { vertical: 'middle' };
                    }
                    currentRow++;
                } else {
                    reportItems.forEach(item => {
                        const row = ws.getRow(currentRow);
                        row.height = 164.3;

                        // B: Listino
                        this.formatDataCell(ws.getCell(`B${currentRow}`), item.listino || '', {
                            font: { size: 20, bold: true }, alignment: { horizontal: 'center', vertical: 'middle', wrapText: true }
                        });
                        // C: Voci
                        this.formatDataCell(ws.getCell(`C${currentRow}`), item.voci || '', {
                            font: { size: 16 }, alignment: { horizontal: 'center', vertical: 'middle', wrapText: true }
                        });
                        // D: Descrizione
                        this.formatDataCell(ws.getCell(`D${currentRow}`), item.descrizione || '', {
                            font: { size: 16 }, alignment: { wrapText: true, vertical: 'middle' }
                        });
                        // E: U.M.
                        this.formatDataCell(ws.getCell(`E${currentRow}`), item.um || 'cad', {
                            font: { size: 16 }, alignment: { horizontal: 'center', vertical: 'middle' }
                        });
                        // F: Q.tà
                        this.formatDataCell(ws.getCell(`F${currentRow}`), Number(item.qty) || 0, {
                            font: { size: 16 }, alignment: { horizontal: 'center', vertical: 'middle' }, numFormat: '#,##0'
                        });
                        // G: Prezzo unitario
                        this.formatDataCell(ws.getCell(`G${currentRow}`), Number(item.price) || 0, {
                            font: { size: 16 }, alignment: { horizontal: 'center', vertical: 'middle' }, numFormat: ExcelExporter.fmtCurrency2
                        });

                        // H: Incr. % contr. (formula)
                        const cellH = ws.getCell(`H${currentRow}`);
                        const cellI = ws.getCell(`I${currentRow}`);
                        const cellJ = ws.getCell(`J${currentRow}`);
                        const cellK = ws.getCell(`K${currentRow}`);

                        const isMaggiorata = item.maggiorata !== false;
                        const fType = cons.formulaType || 'corretta';

                        if (isMaggiorata) {
                            if (fType === 'originale') {
                                cellH.value = { formula: `=G${currentRow}*${markup}` };
                                cellI.value = { formula: `=-H${currentRow}*(1-${discount})` };
                                cellJ.value = { formula: `=G${currentRow}+H${currentRow}+I${currentRow}` };
                                cellK.value = { formula: `=F${currentRow}*J${currentRow}` };
                            } else {
                                cellH.value = { formula: `=G${currentRow}*${markup}` };
                                cellI.value = { formula: `=-(G${currentRow}+H${currentRow})*${discount}` };
                                cellJ.value = { formula: `=G${currentRow}+H${currentRow}+I${currentRow}` };
                                cellK.value = { formula: `=F${currentRow}*J${currentRow}` };
                            }
                        } else {
                            cellH.value = { formula: `=0` };
                            cellI.value = { formula: `=-G${currentRow}*${discount}` };
                            cellJ.value = { formula: `=G${currentRow}+H${currentRow}+I${currentRow}` };
                            cellK.value = { formula: `=F${currentRow}*J${currentRow}` };
                        }

                        this.formatDataCell(cellH, cellH.value, {
                            font: { size: 16 }, alignment: { horizontal: 'center', vertical: 'middle' }, numFormat: ExcelExporter.fmtCurrency4
                        });
                        this.formatDataCell(cellI, cellI.value, {
                            font: { size: 16 }, alignment: { horizontal: 'right', vertical: 'middle' }, numFormat: ExcelExporter.fmtCurrency4
                        });
                        this.formatDataCell(cellJ, cellJ.value, {
                            font: { size: 16 }, alignment: { horizontal: 'right', vertical: 'middle' }, numFormat: ExcelExporter.fmtCurrency6
                        });
                        this.formatDataCell(cellK, cellK.value, {
                            font: { size: 16 }, alignment: { horizontal: 'right', vertical: 'middle' }, numFormat: ExcelExporter.fmtCurrency2
                        });



                        currentRow++;
                    });
                }
                const endItemRow = currentRow - 1;

                // Riga Totale parziale del rapporto
                const totalRowIdx = currentRow;
                ws.getRow(totalRowIdx).height = 21;

                ws.mergeCells(`B${totalRowIdx}:J${totalRowIdx}`);
                this.styleRange(ws, `B${totalRowIdx}:J${totalRowIdx}`, {
                    font: { name: 'Arial', size: 10, bold: true },
                    alignment: { horizontal: 'right', vertical: 'middle' },
                    fill: this.greenFill,
                    border: this.thinBorder
                });
                ws.getCell(`B${totalRowIdx}`).value = `TOTALE RAPPORTO ${report.reportId || ''}`;

                const totalKCell = ws.getCell(`K${totalRowIdx}`);
                totalKCell.value = { formula: `=SUM(K${startItemRow}:K${endItemRow})` };
                totalKCell.font = { name: 'Arial', size: 14, bold: true };
                totalKCell.fill = this.greenFill;
                totalKCell.border = this.thinBorder;
                totalKCell.alignment = { horizontal: 'center', vertical: 'middle' };
                totalKCell.numFmt = ExcelExporter.fmtCurrency2;

                reportTotalCells.push({ reportId: report.reportId, totalRef: `K${totalRowIdx}` });

                currentRow += 2; // Riga vuota dopo il subtotale
            });

            // ---- TOTALE COMPLESSIVO MENSILE ----
            if (reportTotalCells.length > 1) {
                const totalMonthRow = currentRow;
                ws.getRow(totalMonthRow).height = 30;

                ws.mergeCells(`B${totalMonthRow}:J${totalMonthRow}`);
                this.styleRange(ws, `B${totalMonthRow}:J${totalMonthRow}`, {
                    font: { name: 'Arial', size: 12, bold: true },
                    alignment: { horizontal: 'right', vertical: 'middle' },
                    fill: this.greenFill,
                    border: this.thinBorder
                });
                ws.getCell(`B${totalMonthRow}`).value = `TOTALE ${monthWord} ${year}`;

                const totalMonthKCell = ws.getCell(`K${totalMonthRow}`);
                const sumParts = reportTotalCells.map(r => r.totalRef).join(',');
                totalMonthKCell.value = { formula: `=SUM(${sumParts})` };
                totalMonthKCell.font = { name: 'Arial', size: 16, bold: true };
                totalMonthKCell.fill = this.greenFill;
                totalMonthKCell.border = this.thinBorder;
                totalMonthKCell.alignment = { horizontal: 'center', vertical: 'middle' };
                totalMonthKCell.numFmt = ExcelExporter.fmtCurrency2;

                monthSheetInfo.push({ sheetName, reports: reportTotalCells, grandTotalRef: `K${totalMonthRow}` });
            } else if (reportTotalCells.length === 1) {
                // Solo un rapporto: il totale del rapporto è anche il totale del mese
                monthSheetInfo.push({ sheetName, reports: reportTotalCells, grandTotalRef: reportTotalCells[0].totalRef });
            } else {
                monthSheetInfo.push({ sheetName, reports: [], grandTotalRef: null });
            }

        });

        // =====================================================
        // 2. Genera il foglio RIEPILOGO CONSUNTIVI (posizionato PRIMA dei fogli mensili)
        // =====================================================
        const wsRiep = workbook.addWorksheet('RIEPILOGO CONSUNTIVI', {
            views: [{ showGridLines: true }],
            pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
        });

        // Sposta il foglio RIEPILOGO in prima posizione (index 0)
        // ExcelJS non ha un metodo diretto, ma il riepilogo va creato per ultimo e spostato
        // In alternativa, lo gestiamo con l'ordine di creazione
        // (i fogli mensili sono già creati prima, il riepilogo lo mettiamo in cima)
        const allSheets = workbook.worksheets;
        const riepIdx = allSheets.findIndex(s => s.name === 'RIEPILOGO CONSUNTIVI');
        if (riepIdx > 0) {
            // Riordina: riepilogo per primo
            const riepSheet = allSheets.splice(riepIdx, 1)[0];
            allSheets.unshift(riepSheet);
            // ExcelJS internal ordering
            workbook._worksheets = [undefined, ...allSheets];
            allSheets.forEach((s, i) => { s.orderNo = i; });
        }

        // Larghezza colonne A-L (esattamente uguali ai fogli mensili)
        wsRiep.columns = [
            { width: 8.33 },  // A: spacing
            { width: 11.30 }, // B: Listino
            { width: 37.22 }, // C: Voci
            { width: 53.22 }, // D: Descrizione
            { width: 6.67 },  // E: U.M.
            { width: 14.67 }, // F: Q.tà
            { width: 20.44 }, // G: Prezzi/Preziario
            { width: 20.44 }, // H: Nuovo Prezzo
            { width: 20.44 }, // I
            { width: 20.44 }, // J
            { width: 20.44 }, // K: Importo/Totale
            { width: 8.33 }   // L: spacing
        ];

        const riepDate = cons.date ? new Date(cons.date) : new Date();
        buildConsuntivoHeader(wsRiep, cons.oggetto || 'OGGETTO: RIEPILOGO CONSUNTIVI LAVORAZIONI EXTRA CANONE', riepDate, 'riepilogo');

        // Riga 21 - Separatore giallo vuoto
        wsRiep.getRow(21).height = 36.8;
        for (const col of ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']) {
            const cell = wsRiep.getCell(`${col}21`);
            cell.fill = this.yellowFill;
            cell.font = { size: 20 };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = this.thinBorder;
        }

        // Riga 22 - Intestazioni tabella riepilogo
        wsRiep.getRow(22).height = 61.5;

        // B22:D22 merged - NUMERO RAPPORTO DI LAVORO REKEEP
        wsRiep.mergeCells('B22:D22');
        wsRiep.getCell('B22').value = 'NUMERO RAPPORTO DI LAVORO REKEEP';
        wsRiep.getCell('B22').font = { name: 'Aptos', size: 14, bold: true };
        wsRiep.getCell('B22').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        this.styleRange(wsRiep, 'B22:D22', { border: this.thinBorder });

        // E22:G22 merged - PREZIARIO REGIONE LOMBARDIA 2022
        wsRiep.mergeCells('E22:G22');
        wsRiep.getCell('E22').value = 'PREZIARIO REGIONE LOMBARDIA 2022';
        wsRiep.getCell('E22').font = { name: 'Aptos', size: 14, bold: true };
        wsRiep.getCell('E22').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        this.styleRange(wsRiep, 'E22:G22', { border: this.thinBorder });

        // H22:J22 merged - NUOVO PREZZO
        wsRiep.mergeCells('H22:J22');
        wsRiep.getCell('H22').value = 'NUOVO PREZZO';
        wsRiep.getCell('H22').font = { name: 'Aptos', size: 14, bold: true };
        wsRiep.getCell('H22').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        this.styleRange(wsRiep, 'H22:J22', { border: this.thinBorder });

        // K22 - IMPORTO
        wsRiep.getCell('K22').value = 'IMPORTO';
        wsRiep.getCell('K22').font = { name: 'Arial', size: 10, bold: true };
        wsRiep.getCell('K22').alignment = { horizontal: 'center', vertical: 'middle' };
        wsRiep.getCell('K22').border = this.thinBorder;

        // ---- Righe dati del riepilogo (una riga per ogni rapporto di ogni mese) ----
        let riepRow = 23;
        const riepDataStartRow = 23;

        monthSheetInfo.forEach(monthInfo => {
            const isLombardia = monthInfo.sheetName && (
                monthInfo.sheetName.toUpperCase().includes('REG LOMB') ||
                monthInfo.sheetName.toUpperCase().includes('LOMBARDIA') ||
                monthInfo.sheetName.toUpperCase().includes('PREZIARIO')
            );
            monthInfo.reports.forEach(rep => {
                wsRiep.getRow(riepRow).height = 164.3;

                // B:D merged - RAPPORTO DI LAVORO N° : ...
                wsRiep.mergeCells(`B${riepRow}:D${riepRow}`);
                wsRiep.getCell(`B${riepRow}`).value = `RAPPORTO DI LAVORO N° : ${rep.reportId || ''}`;
                wsRiep.getCell(`B${riepRow}`).font = { name: 'Aptos', size: 20 };
                wsRiep.getCell(`B${riepRow}`).alignment = { horizontal: 'center', vertical: 'middle' };
                this.styleRange(wsRiep, `B${riepRow}:D${riepRow}`, { border: this.thinBorder });

                // E:G merged - Preziario (Lombardia)
                wsRiep.mergeCells(`E${riepRow}:G${riepRow}`);
                const preziarioCell = wsRiep.getCell(`E${riepRow}`);
                if (isLombardia && rep.totalRef) {
                    preziarioCell.value = { formula: `='${monthInfo.sheetName}'!${rep.totalRef}` };
                } else {
                    preziarioCell.value = 0;
                }
                preziarioCell.font = { name: 'Arial', size: 16 };
                preziarioCell.alignment = { horizontal: 'center', vertical: 'middle' };
                preziarioCell.numFmt = ExcelExporter.fmtCurrency2;
                this.styleRange(wsRiep, `E${riepRow}:G${riepRow}`, { border: this.thinBorder });

                // H:J merged - Nuovo Prezzo
                wsRiep.mergeCells(`H${riepRow}:J${riepRow}`);
                const nuovoPrezzoCell = wsRiep.getCell(`H${riepRow}`);
                if (!isLombardia && rep.totalRef) {
                    nuovoPrezzoCell.value = { formula: `='${monthInfo.sheetName}'!${rep.totalRef}` };
                } else {
                    nuovoPrezzoCell.value = 0;
                }
                nuovoPrezzoCell.font = { name: 'Arial', size: 16 };
                nuovoPrezzoCell.alignment = { horizontal: 'center', vertical: 'middle' };
                nuovoPrezzoCell.numFmt = ExcelExporter.fmtCurrency2;
                this.styleRange(wsRiep, `H${riepRow}:J${riepRow}`, { border: this.thinBorder });

                // K - Importo (formula SUM E:J)
                const importoCell = wsRiep.getCell(`K${riepRow}`);
                importoCell.value = { formula: `=SUM(E${riepRow}:J${riepRow})` };
                importoCell.font = { name: 'Arial', size: 16 };
                importoCell.alignment = { vertical: 'middle' };
                importoCell.numFmt = ExcelExporter.fmtCurrency2;
                importoCell.border = this.thinBorder;

                riepRow++;
            });
        });

        const riepDataEndRow = riepRow - 1;

        const totalRowIndex = riepRow;
        wsRiep.getRow(totalRowIndex).height = 30;

        // B:D merged - Totale Label
        wsRiep.mergeCells(`B${totalRowIndex}:D${totalRowIndex}`);
        wsRiep.getCell(`B${totalRowIndex}`).value = 'Totale';
        wsRiep.getCell(`B${totalRowIndex}`).font = { name: 'Arial', size: 16, bold: true };
        wsRiep.getCell(`B${totalRowIndex}`).alignment = { horizontal: 'right', vertical: 'middle' };
        this.styleRange(wsRiep, `B${totalRowIndex}:D${totalRowIndex}`, { border: this.thinBorder });

        // E:G merged - Total Preziario (Lombardia) Formula
        wsRiep.mergeCells(`E${totalRowIndex}:G${totalRowIndex}`);
        const totalECell = wsRiep.getCell(`E${totalRowIndex}`);
        if (riepDataEndRow >= 23) {
            totalECell.value = { formula: `=SUM(E23:E${riepDataEndRow})` };
        } else {
            totalECell.value = 0;
        }
        totalECell.font = { name: 'Arial', size: 16, bold: true };
        totalECell.alignment = { horizontal: 'center', vertical: 'middle' };
        totalECell.numFmt = ExcelExporter.fmtCurrency2;
        this.styleRange(wsRiep, `E${totalRowIndex}:G${totalRowIndex}`, { border: this.thinBorder });

        // H:J merged - Total Nuovo Prezzo Formula
        wsRiep.mergeCells(`H${totalRowIndex}:J${totalRowIndex}`);
        const totalHCell = wsRiep.getCell(`H${totalRowIndex}`);
        if (riepDataEndRow >= 23) {
            totalHCell.value = { formula: `=SUM(H23:H${riepDataEndRow})` };
        } else {
            totalHCell.value = 0;
        }
        totalHCell.font = { name: 'Arial', size: 16, bold: true };
        totalHCell.alignment = { horizontal: 'center', vertical: 'middle' };
        totalHCell.numFmt = ExcelExporter.fmtCurrency2;
        this.styleRange(wsRiep, `H${totalRowIndex}:J${totalRowIndex}`, { border: this.thinBorder });

        // K - Total Importo Formula
        const totalKCell = wsRiep.getCell(`K${totalRowIndex}`);
        if (riepDataEndRow >= 23) {
            totalKCell.value = { formula: `=SUM(K23:K${riepDataEndRow})` };
        } else {
            totalKCell.value = 0;
        }
        totalKCell.font = { name: 'Arial', size: 14, bold: true };
        totalKCell.fill = this.greenFill;
        totalKCell.alignment = { horizontal: 'center', vertical: 'middle' };
        totalKCell.numFmt = ExcelExporter.fmtCurrency2;
        totalKCell.border = this.thinBorder;



        // =====================================================
        // 3. Salvataggio
        // =====================================================
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const fileName = `CONSUNTIVO-${(cons.name || 'CONSUNTIVO').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 40)}.xlsx`;
        saveAs(blob, fileName);
    },

    async exportOreExtra(oe) {
        // Carica il modello originale
        const response = await fetch('/Originali/originale ore extra/RAI_CONS ORE EXTRA_LUG AGO SET 26.xlsx');
        if (!response.ok) {
            throw new Error('Impossibile caricare il file modello Excel.');
        }
        const arrayBuffer = await response.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);

        // Fogli attivi nel modello (indici 0-based)
        // 6: RIEPILOGO 3Q26
        // 7: LUG 2026 consuntivo
        // 10: AGO 2026 consuntivo
        // 11: SET 2026 consuntivo 
        const sheetRiep = workbook.getWorksheet('RIEPILOGO 3Q26') || workbook.worksheets[6];
        const sheetLug = workbook.getWorksheet('LUG 2026 consuntivo') || workbook.worksheets[7];
        const sheetAgo = workbook.getWorksheet('AGO 2026 consuntivo') || workbook.worksheets[10];
        const sheetSet = workbook.getWorksheet('SET 2026 consuntivo ') || workbook.worksheets[11];

        const nameLug = (oe.months[0] && oe.months[0].monthName) || 'LUG 2026 consuntivo';
        const nameAgo = (oe.months[1] && oe.months[1].monthName) || 'AGO 2026 consuntivo';
        const nameSet = (oe.months[2] && oe.months[2].monthName) || 'SET 2026 consuntivo ';

        if (sheetLug) sheetLug.name = nameLug;
        if (sheetAgo) sheetAgo.name = nameAgo;
        if (sheetSet) sheetSet.name = nameSet;

        // 1. Popola il Riepilogo
        if (sheetRiep) {
            // Aggiorna il titolo
            sheetRiep.getCell('A16').value = (oe.name || 'ORE EXTRA').toUpperCase();

            // Aggiorna le tariffe contrattuali
            sheetRiep.getCell('B8').value = oe.costoBase || 18.30;
            sheetRiep.getCell('B10').value = (oe.markupPercent || 26.50) / 100;
            sheetRiep.getCell('B11').value = { formula: '=B8*(1+B10)' };
            sheetRiep.getCell('B12').value = (oe.discountPercent || 31.00) / 100;
            sheetRiep.getCell('B13').value = { formula: '=B8*B10*(1-B12)' };
            sheetRiep.getCell('B14').value = { formula: '=B8+B13' };

            // Righe di consuntivo mensile - puntano alle righe totali corrette nel modello (63 per Mese 1/2, 62 per Mese 3)
            sheetRiep.getCell('A20').value = nameLug.split(' ')[0].toUpperCase();
            sheetRiep.getCell('G20').value = { formula: `='${nameLug}'!G63` };

            sheetRiep.getCell('A21').value = nameAgo.split(' ')[0].toUpperCase();
            sheetRiep.getCell('G21').value = { formula: `='${nameAgo}'!G63` };

            sheetRiep.getCell('A22').value = nameSet.split(' ')[0].toUpperCase();
            sheetRiep.getCell('G22').value = { formula: `='${nameSet}'!G62` };
        }

        // 2. Popola i singoli fogli mensili
        const sheetsList = [sheetLug, sheetAgo, sheetSet];
        sheetsList.forEach((ws, mIndex) => {
            if (!ws) return;
            const m = oe.months[mIndex];
            if (!m) return;

            const numDays = (m.part2 && m.part2.length) || 30;

            // Titolo
            ws.getCell('A16').value = m.monthName.toUpperCase();

            // Tariffe
            ws.getCell('B8').value = oe.costoBase || 18.30;
            ws.getCell('B10').value = (oe.markupPercent || 26.50) / 100;
            ws.getCell('B11').value = { formula: '=B8*(1+B10)' };
            ws.getCell('B12').value = (oe.discountPercent || 31.00) / 100;
            ws.getCell('B13').value = { formula: '=B8*B10*(1-B12)' };
            ws.getCell('B14').value = { formula: '=B8+B13' };

            // Parte 1 (feriale diurno, notturno, festivo)
            let part1RowIdx = 19;
            (m.part1 || []).forEach(item => {
                ws.getCell('A' + part1RowIdx).value = item.description;
                ws.getCell('B' + part1RowIdx).value = item.oreGg;
                ws.getCell('C' + part1RowIdx).value = item.giorni;
                ws.getCell('D' + part1RowIdx).value = { formula: `=B${part1RowIdx}*C${part1RowIdx}` };
                ws.getCell('E' + part1RowIdx).value = item.maggiorazione;
                ws.getCell('F' + part1RowIdx).value = { formula: `=B$8*(1+E${part1RowIdx})*(1+B$10)-(B$8*(1+E${part1RowIdx})*B$10*B$12)` };
                ws.getCell('G' + part1RowIdx).value = { formula: `=D${part1RowIdx}*F${part1RowIdx}` };
                part1RowIdx++;
            });

            // Totale Parte 1
            ws.getCell('D22').value = { formula: '=SUM(D19:D21)' };
            ws.getCell('G22').value = { formula: '=SUM(G19:G21)' };

            // Parte 2 (seconda risorsa) - Safeguard per la lunghezza del mese rispetto al modello
            const maxP2Rows = (mIndex === 2) ? 30 : 31; // Il terzo foglio (Settembre) ha 30 righe, gli altri 31

            // Determina mese ed anno per generare la lista completa dei giorni calendariali del mese
            const monthParts = m.monthName.split(' ');
            const mStr = monthParts[0].toUpperCase();
            const year = parseInt(monthParts[1]) || 2026;
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

            const allDays = [];
            const date = new Date(year, monthIndex, 1);
            while (date.getMonth() === monthIndex) {
                const dayStr = date.getDate();
                const formattedDate = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(dayStr).padStart(2, '0')}`;
                allDays.push(formattedDate);
                date.setDate(date.getDate() + 1);
            }

            // Scrive i dati mappando correttamente per data calendariale
            allDays.slice(0, maxP2Rows).forEach((dateStr, dayIndex) => {
                const p2Row = 29 + dayIndex;
                const foundDay = (m.part2 || []).find(d => d.date === dateStr);

                if (foundDay) {
                    ws.getCell('B' + p2Row).value = foundDay.hours || 0;
                    ws.getCell('C' + p2Row).value = new Date(foundDay.date);
                    ws.getCell('E' + p2Row).value = 'diurno';
                    ws.getCell('F' + p2Row).value = { formula: '=F19' };
                    ws.getCell('G' + p2Row).value = { formula: `=B${p2Row}*F${p2Row}` };
                    ws.getRow(p2Row).hidden = false;
                } else {
                    // Se il giorno è stato eliminato dall'utente, azzera ore ed importo e non impostare la data, nascondendo la riga
                    ws.getCell('B' + p2Row).value = 0;
                    ws.getCell('C' + p2Row).value = null;
                    ws.getCell('E' + p2Row).value = '';
                    ws.getCell('G' + p2Row).value = { formula: `=B${p2Row}*F${p2Row}` };
                    ws.getRow(p2Row).hidden = true;
                }
            });

            // Pulisce le righe residue se il mese corrente ha meno giorni del foglio modello (es. Febbraio) e le nasconde
            if (allDays.length < maxP2Rows) {
                for (let r = 29 + allDays.length; r < 29 + maxP2Rows; r++) {
                    ws.getCell('B' + r).value = 0;
                    ws.getCell('C' + r).value = null;
                    ws.getCell('G' + r).value = { formula: `=B${r}*F${r}` };
                    ws.getRow(r).hidden = true;
                }
            }

            // Totale Parte 2 (sempre calcolato sulla capienza massima del foglio modello per coerenza di layout)
            const endP2Row = 28 + maxP2Rows;
            const totP2Row = 29 + maxP2Rows;
            ws.getCell('B' + totP2Row).value = { formula: `=SUM(B29:B${endP2Row})` };
            ws.getCell('G' + totP2Row).value = { formula: `=SUM(G29:G${endP2Row})` };

            // Totale Generale
            const totGenRow = 32 + maxP2Rows;
            ws.getCell('G' + totGenRow).value = { formula: `=G22+G${totP2Row}` };
        });

        // 3. Esporta
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const fileName = `ORE_EXTRA-${(oe.name || 'ORE_EXTRA').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 40)}.xlsx`;
        saveAs(blob, fileName);
    },

    async exportRapportoLavoro(doc) {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Antigravity Gestione Preventivi';
        workbook.lastModifiedBy = 'Antigravity';
        workbook.created = new Date();
        workbook.modified = new Date();

        const sheetName = `Rapporto ${doc.number || '00000'}`;
        const ws = workbook.addWorksheet(sheetName.substring(0, 31), {
            views: [{ showGridLines: true }],
            pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
        });

        // Column widths
        ws.columns = [
            { width: 35.00 }, // A: Descrizione / Cognome e Nome
            { width: 12.00 }, // B: U.M. / Dalle Ore
            { width: 12.00 }, // C: Q.tà / Alle Ore
            { width: 13.00 }, // D: Tot. Ore Ord
            { width: 13.00 }, // E: Tot. Ore Str
            { width: 13.00 }, // F: Tot. Ore Fest
            { width: 13.00 }, // G: Tot. Ore Viaggio
            { width: 16.00 }  // H: Spese Varie
        ];

        const formatCell = (cell, options = {}) => {
            cell.font = Object.assign({ name: 'Arial', size: 9 }, options.font || {});
            
            if (options.border !== false) {
                cell.border = Object.assign({
                    top: { style: 'thin', color: { argb: 'FFA0A0A0' } },
                    left: { style: 'thin', color: { argb: 'FFA0A0A0' } },
                    bottom: { style: 'thin', color: { argb: 'FFA0A0A0' } },
                    right: { style: 'thin', color: { argb: 'FFA0A0A0' } }
                }, options.border || {});
            }

            if (options.fill) {
                cell.fill = options.fill;
            }

            cell.alignment = Object.assign({ vertical: 'middle', horizontal: 'left' }, options.alignment || {});
            
            if (options.numFormat) {
                cell.numFmt = options.numFormat;
            }
        };

        const formatHeaderCell = (cell, text, options = {}) => {
            cell.value = text;
            formatCell(cell, Object.assign({
                font: { name: 'Arial', bold: true, size: 8.5 },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } },
                alignment: { horizontal: 'center' },
                border: {
                    top: { style: 'thin', color: { argb: 'FF000000' } },
                    left: { style: 'thin', color: { argb: 'FF000000' } },
                    bottom: { style: 'thin', color: { argb: 'FF000000' } },
                    right: { style: 'thin', color: { argb: 'FF000000' } }
                }
            }, options));
        };

        const formatDataCell = (cell, val, options = {}) => {
            cell.value = val;
            formatCell(cell, Object.assign({
                font: { name: 'Arial', bold: false, size: 9 },
                border: {
                    top: { style: 'thin', color: { argb: 'FFA0A0A0' } },
                    left: { style: 'thin', color: { argb: 'FFA0A0A0' } },
                    bottom: { style: 'thin', color: { argb: 'FFA0A0A0' } },
                    right: { style: 'thin', color: { argb: 'FFA0A0A0' } }
                }
            }, options));
        };

        const styleMergedRange = (ws, startCol, startRow, endCol, endRow, formatFn, val, options = {}) => {
            for (let r = startRow; r <= endRow; r++) {
                for (let c = startCol; c <= endCol; c++) {
                    const cell = ws.getCell(r, c);
                    formatFn(cell, '', options);
                }
            }
            ws.mergeCells(startRow, startCol, endRow, endCol);
            const topLeft = ws.getCell(startRow, startCol);
            topLeft.value = val;
            if (options.alignment) {
                topLeft.alignment = Object.assign({ vertical: 'middle' }, options.alignment);
            }
        };

        // Company Logo
        try {
            const companyLogoB64 = (typeof state !== 'undefined' && state.settings && state.settings.companyLogo === 'cmf')
                ? (window.CMF_LOGO || (typeof CMF_LOGO !== 'undefined' ? CMF_LOGO : null))
                : (window.REKEEP_LOGO || (typeof REKEEP_LOGO !== 'undefined' ? REKEEP_LOGO : null));
            if (companyLogoB64) {
                const cleanB64 = companyLogoB64.split(',')[1] || companyLogoB64;
                const companyImageId = workbook.addImage({
                    base64: cleanB64,
                    extension: 'png',
                });
                ws.addImage(companyImageId, {
                    tl: { col: 0, row: 1 }, // Column A (0), Row 2 (1)
                    br: { col: 2, row: 4 }, // Column C (2), Row 5 (4)
                    editAs: 'oneCell'
                });
            }
        } catch (err) {
            console.error('[Rapporto Export] Errore logo:', err);
        }

        // Title
        styleMergedRange(ws, 3, 2, 6, 3, formatHeaderCell, 'RAPPORTO DI LAVORO', {
            font: { name: 'Arial', size: 14, bold: true },
            alignment: { vertical: 'middle', horizontal: 'center' }
        });

        // Code
        ws.getCell('H2').value = 'MFM.MOD.PG.07.08_07_01';
        ws.getCell('H2').font = { name: 'Arial', size: 8, italic: true, color: { argb: 'FF888888' } };
        ws.getCell('H2').alignment = { horizontal: 'right' };

        // Reference numbers (Rows 5 & 6)
        ws.getRow(5).height = 15;
        formatDataCell(ws.getCell('A5'), 'RAPPORTO N°', { font: { name: 'Arial', bold: true, size: 8, color: { argb: 'FF888888' } }, border: false });
        
        ws.getRow(6).height = 26;
        formatDataCell(ws.getCell('A6'), doc.number || '', { font: { name: 'Arial', bold: true, color: { argb: 'FFFF0000' }, size: 14 }, border: false, alignment: { vertical: 'top', horizontal: 'left' } });
        
        formatDataCell(ws.getCell('C6'), 'RICHIESTA N°', { font: { name: 'Arial', bold: true, size: 9, color: { argb: 'FF555555' } }, border: false, alignment: { vertical: 'middle', horizontal: 'left' } });
        styleMergedRange(ws, 4, 6, 5, 6, (cell, val, opts) => {
            formatDataCell(cell, val, opts);
        }, doc.richiestaNum || '', { 
            font: { name: 'Arial', bold: true, size: 10 },
            border: { bottom: { style: 'dotted', color: { argb: 'FF000000' } } },
            alignment: { vertical: 'middle', horizontal: 'center' }
        });
        
        formatDataCell(ws.getCell('F6'), 'DITTA ESECUTRICE', { font: { name: 'Arial', bold: true, size: 9, color: { argb: 'FF555555' } }, border: false, alignment: { vertical: 'middle', horizontal: 'left' } });
        styleMergedRange(ws, 7, 6, 8, 6, (cell, val, opts) => {
            formatDataCell(cell, val, opts);
        }, doc.dittaEsecutrice || 'Rekeep SpA', { 
            font: { name: 'Arial', bold: true, size: 10 },
            border: { bottom: { style: 'dotted', color: { argb: 'FF000000' } } },
            alignment: { vertical: 'middle', horizontal: 'center' }
        });

        // Location / Client (Row 8, 9)
        ws.getRow(8).height = 22;
        formatHeaderCell(ws.getCell('A8'), 'CLIENTE:');
        styleMergedRange(ws, 2, 8, 4, 8, formatDataCell, doc.cliente || '', { font: { name: 'Arial', bold: true, size: 9.5 } });
        formatHeaderCell(ws.getCell('E8'), 'VIA:');
        styleMergedRange(ws, 6, 8, 7, 8, formatDataCell, doc.via || '');
        formatDataCell(ws.getCell('H8'), 'N°: ' + (doc.civico || ''));

        ws.getRow(9).height = 22;
        formatHeaderCell(ws.getCell('A9'), 'EDIFICIO:');
        formatDataCell(ws.getCell('B9'), doc.edificio || '');
        formatHeaderCell(ws.getCell('C9'), 'CITTÀ:');
        styleMergedRange(ws, 4, 9, 5, 9, formatDataCell, doc.citta || '');
        formatHeaderCell(ws.getCell('F9'), 'PIANO:');
        formatDataCell(ws.getCell('G9'), doc.piano || '');
        formatDataCell(ws.getCell('H9'), 'VANO: ' + (doc.vano || ''));

        // Checkboxes Groups (Rows 11-16)
        ws.getRow(11).height = 20;
        styleMergedRange(ws, 1, 11, 3, 11, formatHeaderCell, 'TIPOLOGIA DI INTERVENTO');
        styleMergedRange(ws, 4, 11, 6, 11, formatHeaderCell, 'CAUSA INTERVENTO');
        styleMergedRange(ws, 7, 11, 8, 11, formatHeaderCell, 'LAVORI ESEGUITI');

        const renderExcelCB = (checked, label) => {
            return `${checked ? '[X]' : '[ ]'} ${label}`;
        };

        const tipos = doc.tipologiaIntervento || [];
        const causa = doc.causaIntervento || [];
        const lavori = doc.lavoriEseguiti || [];

        ws.getRow(12).height = 20;
        styleMergedRange(ws, 1, 12, 3, 12, formatDataCell, renderExcelCB(tipos.includes('EMERGENZA'), 'EMERGENZA'));
        styleMergedRange(ws, 4, 12, 6, 12, formatDataCell, renderExcelCB(causa.includes('MANUTENZIONE PER USURA'), 'MANUTENZIONE PER USURA'));
        styleMergedRange(ws, 7, 12, 8, 12, formatDataCell, renderExcelCB(lavori.includes('COMPLETATI'), 'COMPLETATI'));

        ws.getRow(13).height = 20;
        styleMergedRange(ws, 1, 13, 3, 13, formatDataCell, renderExcelCB(tipos.includes('URGENZA'), 'URGENZA'));
        styleMergedRange(ws, 4, 13, 6, 13, formatDataCell, renderExcelCB(causa.includes('GUASTO ACCIDENTALE USO IMPROPRIO'), 'GUASTO ACCIDENTALE / IMPROPRIO'));
        styleMergedRange(ws, 7, 13, 8, 13, formatDataCell, renderExcelCB(lavori.includes('DA COMPLETARE'), 'DA COMPLETARE'));

        ws.getRow(14).height = 20;
        styleMergedRange(ws, 1, 14, 3, 14, formatDataCell, renderExcelCB(tipos.includes('NORMALE'), 'NORMALE'));
        styleMergedRange(ws, 4, 14, 6, 14, formatDataCell, renderExcelCB(causa.includes('GUASTO DOLOSO'), 'GUASTO DOLOSO'));
        styleMergedRange(ws, 7, 14, 8, 14, formatDataCell, renderExcelCB(lavori.includes('SOSPESI'), 'SOSPESI'));

        ws.getRow(15).height = 20;
        styleMergedRange(ws, 1, 15, 3, 15, formatDataCell, renderExcelCB(tipos.includes('MANUTENZIONE PROGRAMMATA'), 'MANUTENZIONE PROGRAMMATA'));
        let causaAltroTxt = 'ALTRO';
        if (causa.includes('ALTRO') && doc.causaInterventoAltro) causaAltroTxt += ': ' + doc.causaInterventoAltro;
        styleMergedRange(ws, 4, 15, 6, 15, formatDataCell, renderExcelCB(causa.includes('ALTRO'), causaAltroTxt));
        let lavoriAltroTxt = 'ALTRO';
        if (lavori.includes('ALTRO') && doc.lavoriEseguitiAltro) lavoriAltroTxt += ': ' + doc.lavoriEseguitiAltro;
        styleMergedRange(ws, 7, 15, 8, 15, formatDataCell, renderExcelCB(lavori.includes('ALTRO'), lavoriAltroTxt));

        ws.getRow(16).height = 20;
        styleMergedRange(ws, 1, 16, 3, 16, formatDataCell, renderExcelCB(tipos.includes('MANUTENZIONE STRAORDINARIA'), 'MANUTENZIONE STRAORDINARIA'));
        styleMergedRange(ws, 4, 16, 6, 16, formatDataCell, '');
        styleMergedRange(ws, 7, 16, 8, 16, formatDataCell, '');

        // Description (Rows 18-21)
        ws.getRow(18).height = 20;
        styleMergedRange(ws, 1, 18, 8, 18, formatHeaderCell, 'DESCRIZIONE INTERVENTO', { alignment: { horizontal: 'left' } });
        styleMergedRange(ws, 1, 19, 8, 21, formatDataCell, doc.descrizioneIntervento || '', { alignment: { vertical: 'top', wrapText: true } });

        // Operators Table (Rows 23-29)
        ws.getRow(23).height = 20;
        styleMergedRange(ws, 1, 23, 8, 23, formatHeaderCell, 'OPERATORI', { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } } });
        
        ws.getRow(24).height = 20;
        formatHeaderCell(ws.getCell('A24'), 'COGNOME E NOME');
        formatHeaderCell(ws.getCell('B24'), 'DALLE ORE');
        formatHeaderCell(ws.getCell('C24'), 'ALLE ORE');
        formatHeaderCell(ws.getCell('D24'), 'TOT. ORE ORD.');
        formatHeaderCell(ws.getCell('E24'), 'TOT. ORE STR.');
        formatHeaderCell(ws.getCell('F24'), 'TOT. ORE FEST.');
        formatHeaderCell(ws.getCell('G24'), 'TOT. ORE VIAG.');
        formatHeaderCell(ws.getCell('H24'), 'SPESE VARIE');
        
        const ops = doc.operatori || [];
        for (let i = 0; i < 4; i++) {
            const op = ops[i] || {};
            const rIdx = 25 + i;
            ws.getRow(rIdx).height = 20;
            formatDataCell(ws.getCell('A' + rIdx), op.cognomeNome || '');
            formatDataCell(ws.getCell('B' + rIdx), op.dalleOre || '', { alignment: { horizontal: 'center' } });
            formatDataCell(ws.getCell('C' + rIdx), op.alleOre || '', { alignment: { horizontal: 'center' } });
            formatDataCell(ws.getCell('D' + rIdx), op.oreOrd ? Number(op.oreOrd) : '', { alignment: { horizontal: 'right' } });
            formatDataCell(ws.getCell('E' + rIdx), op.oreStr ? Number(op.oreStr) : '', { alignment: { horizontal: 'right' } });
            formatDataCell(ws.getCell('F' + rIdx), op.oreFest ? Number(op.oreFest) : '', { alignment: { horizontal: 'right' } });
            formatDataCell(ws.getCell('G' + rIdx), op.oreViaggio ? Number(op.oreViaggio) : '', { alignment: { horizontal: 'right' } });
            formatDataCell(ws.getCell('H' + rIdx), op.speseVarie ? Number(op.speseVarie) : '', { alignment: { horizontal: 'right' }, numFormat: '#,##0.00 €' });
        }

        // Materials Table (Rows 30-38)
        ws.getRow(30).height = 20;
        styleMergedRange(ws, 1, 30, 8, 30, formatHeaderCell, 'MATERIALI IMPIEGATI', { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } } });
        
        ws.getRow(31).height = 20;
        styleMergedRange(ws, 1, 31, 5, 31, formatHeaderCell, 'DESCRIZIONE');
        formatHeaderCell(ws.getCell('F31'), 'U.M.');
        styleMergedRange(ws, 7, 31, 8, 31, formatHeaderCell, 'QUANTITÀ');

        const mats = doc.materiali || [];
        for (let i = 0; i < 6; i++) {
            const mat = mats[i] || {};
            const rIdx = 32 + i;
            ws.getRow(rIdx).height = 20;
            styleMergedRange(ws, 1, rIdx, 5, rIdx, formatDataCell, mat.descrizione || '');
            formatDataCell(ws.getCell('F' + rIdx), mat.um || '', { alignment: { horizontal: 'center' } });
            styleMergedRange(ws, 7, rIdx, 8, rIdx, formatDataCell, mat.qty !== undefined && mat.qty !== '' ? Number(mat.qty) : '', { alignment: { horizontal: 'right' } });
        }

        // Anomalies (Rows 39-42)
        ws.getRow(39).height = 20;
        styleMergedRange(ws, 1, 39, 4, 39, formatHeaderCell, 'DESCRIZIONE ANOMALIE O NON CONFORMITÀ RILEVATE', { alignment: { horizontal: 'left' } });
        styleMergedRange(ws, 5, 39, 8, 39, formatHeaderCell, 'AZIONI CORRETTIVE O INTERVENTI DI RIPRISTINO ESEGUITI', { alignment: { horizontal: 'left' } });

        styleMergedRange(ws, 1, 40, 4, 42, formatDataCell, doc.anomalieDescrizione || '', { alignment: { vertical: 'top', wrapText: true } });
        styleMergedRange(ws, 5, 40, 8, 42, formatDataCell, doc.anomalieAzioni || '', { alignment: { vertical: 'top', wrapText: true } });

        // Signatures and Date (Rows 44-47)
        ws.getRow(44).height = 24;
        styleMergedRange(ws, 1, 44, 2, 44, (cell, val, opts) => {
            cell.value = val;
            cell.font = { name: 'Arial', size: 8, bold: true };
            cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }, 'DICHIARA CHE I LAVORI SUINDICATI SONO STATI ESEGUITI IN DATA:');
        
        ws.getCell('C44').value = doc.dataLavori ? new Date(doc.dataLavori) : '';
        ws.getCell('C44').font = { name: 'Arial', size: 9, bold: true, underline: true };
        ws.getCell('C44').numFmt = 'dd/mm/yyyy';
        ws.getCell('C44').alignment = { vertical: 'middle', horizontal: 'left' };

        ws.getRow(46).height = 18;
        styleMergedRange(ws, 1, 46, 2, 46, formatHeaderCell, 'FIRMA ESECUTORE');
        styleMergedRange(ws, 3, 46, 5, 46, formatHeaderCell, 'REFERENTE DEL CLIENTE');
        styleMergedRange(ws, 6, 46, 8, 46, formatHeaderCell, 'IL RESPONSABILE');

        ws.getRow(47).height = 28;
        styleMergedRange(ws, 1, 47, 2, 47, formatDataCell, doc.firmaEsecutore || '', { alignment: { horizontal: 'center' } });
        styleMergedRange(ws, 3, 47, 5, 47, formatDataCell, doc.referenteCliente || '', { alignment: { horizontal: 'center' } });
        styleMergedRange(ws, 6, 47, 8, 47, formatDataCell, doc.responsabile || '', { alignment: { horizontal: 'center' } });

        // Footer info (Row 49)
        ws.getCell('A49').value = 'EMESSO DA: DO ED. 1 DEL 16.03.2014';
        ws.getCell('A49').font = { name: 'Arial', size: 7, color: { argb: 'FF888888' } };

        // Export workbook
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const fileName = `RAPPORTO_LAVORO_${doc.number || 'VUOTO'}.xlsx`;
        saveAs(blob, fileName);
    },
};

// Esponi globalmente
window.ExcelExporter = ExcelExporter;
