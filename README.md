# Atlante Illustrato dei Promessi Sposi

Mappa interattiva delle illustrazioni dell'edizione Quarantana dei Promessi Sposi di Alessandro Manzoni.

## Descrizione del progetto

L'atlante presenta una visualizzazione geografica e diacronica delle illustrazioni contenute nell'edizione del 1840 de "I promessi sposi" e della "Storia della colonna infame", permettendo di esplorare la dimensione spaziale dell'opera manzoniana attraverso le rappresentazioni iconografiche del testo.
La mappa rappresenta una demo interattiva da presentare alla Notte dei Ricercatori Unibo 2025.

## Caratteristiche
- Visualizzazione geografica delle illustrazioni su mappa interattiva
- Timeline interattiva organizzata per capitoli
- Filtri dinamici per luoghi, autori e capitoli
- Spider graphs per visualizzare aggregazioni di contenuti per città
- Schede dettagliate per ogni illustrazione con metadati completi

## Fonte dei dati

I dati sono stati estratti dalla **Digital Library del FICLIT** (Dipartimento di Filologia Classica e Italianistica dell'Università di Bologna) tramite API REST. I metadati originali erano strutturati in formato JSON-LD.

- **API REST**: https://dlrc.ficlit.unibo.it/api/items
- **Digital Library FICLIT**: https://dlrc.ficlit.unibo.it

## Fonte testuale

Le illustrazioni fanno riferimento all'edizione:

**Titolo**: I promessi sposi ; Storia della colonna infame, inedita : storia milanese del secolo 17. scoperta e rifatta da Alessandro Manzoni

**Descrizione**: 864 p. : ill. ; 29 cm  
**Editore**: Milano : dalla Tipografia Guglielmini e Redaelli  
**Data**: 1840  
**Catalogo OPAC**: IT\ICCU\VBA\0000224  

**Scheda completa**: https://dlrc.ficlit.unibo.it/s/lib/item/232045

## Accesso

Il progetto è accessibile all'indirizzo:

## Tecnologie utilizzate
- **Leaflet.js** per la mappa interattiva
- **D3.js** per le visualizzazioni e i spider graphs
- **GeoJSON** per la strutturazione dei dati geografici
- **JavaScript ES6+** per la logica applicativa

## Crediti

Progetto sviluppato utilizzando i dati della Digital Library del Dipartimento di Filologia Classica e Italianistica dell'Università di Bologna.
