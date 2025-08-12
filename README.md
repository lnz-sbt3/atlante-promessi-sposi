# Atlante Illustrato dei Promessi Sposi

Mappa interattiva delle illustrazioni dell'edizione Quarantana dei Promessi Sposi di Alessandro Manzoni.

## Descrizione del Progetto

L'atlante presenta una visualizzazione geografica e diacronica delle illustrazioni contenute nell'edizione del 1840 de "I promessi sposi" e della "Storia della colonna infame", permettendo di esplorare la dimensione spaziale dell'opera manzoniana attraverso le rappresentazioni iconografiche del testo.
La mappa rappresenta una demo interattiva da presentare alla Notte dei Ricercatori Unibo 2025.

## Caratteristiche Principali

- **Mappa Interattiva**: Visualizzazione geografica dei luoghi manzoniani
- **Timeline Dinamica**: Navigazione cronologica per capitoli
- **Filtri Avanzati**: Ricerca per capitoli, luoghi, autori, personaggi e pagine
- **Spider Graph**: Visualizzazione delle connessioni tra elementi dello stesso luogo
- **Card Informative**: Dettagli completi per ogni elemento
- **Breadcrumb System**: Gestione filtri attivi con URL persistenti
- **Design Responsivo**: Ottimizzato per desktop e dispositivi mobili

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

## 🌐 Sito Live

**Accedi al progetto:** [https://lnz-sbt3.github.io/atlante-promessi-sposi/](https://lnz-sbt3.github.io/atlante-promessi-sposi/)

### Sistema di Fallback
Se il dataset principale non dovesse caricarsi, l'applicazione caricherà automaticamente dati di esempio per mantenere tutte le funzionalità operative.

## Tecnologie Utilizzate

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Mappe**: Leaflet.js
- **Visualizzazioni**: D3.js
- **Dati**: GeoJSON
- **Stile**: CSS Grid, Flexbox, Gradients

## Struttura del Progetto

```
atlante-manzoni/
├── index.html              # Pagina principale
├── css/
│   └── styles.css          # Stili principali
├── js/
│   └── app.js              # Logica applicazione
├── data/
│   └── dl_quarantana.geojson # Dati geografici
├── assets/
│   └── AtlanteManzoni_Logo.png # Logo progetto
├── README.md               # Documentazione
└── .gitignore             # File Git ignore
```

## Installazione e Avvio

### Prerequisiti
- Server web locale (per servire i file statici)
- Browser moderno con supporto ES6+

### Avvio Rapido

1. **Clona il repository**:
```bash
git clone https://github.com/your-username/atlante-manzoni.git
cd atlante-manzoni
```

2. **Avvia un server locale**:
```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (se hai http-server installato)
npx http-server

# Con PHP
php -S localhost:8000
```

3. **Apri nel browser**:
```
http://localhost:8000
```

## Formato Dati

Il progetto utilizza file GeoJSON con la seguente struttura:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "sequence": "1",
        "title": "Titolo illustrazione",
        "chapter": "Cap. I",
        "page_number": 5,
        "place": "Lecco",
        "authors": ["A. Manzoni"],
        "characters": ["Personaggio"],
        "type": "Tipo illustrazione",
        "image": "path/to/image.jpg",
        "link": "https://link-to-resource"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [9.3933, 45.8566]
      }
    }
  ]
}
```

## Utilizzo

### Navigazione Base
- **Zoom e Pan**: Utilizza la mappa per esplorare i territori
- **Clic sui cerchi**: Visualizza dettagli delle illustrazioni
- **Menu FAB**: Accedi a timeline e filtri dal menu in basso a sinistra

### Timeline
- **Promessi Sposi**: Visualizza capitoli del romanzo
- **Colonna Infame**: Mostra capitoli dell'opera storica
- **Punti Timeline**: Clic per dettagli rapidi

### Filtri
- **Capitoli**: Filtra per capitolo specifico
- **Luoghi**: Mostra solo elementi di un luogo
- **Autori**: Filtra per autore delle illustrazioni
- **Personaggi**: Visualizza per personaggio coinvolto
- **Range Pagine**: Seleziona intervallo di pagine

### Spider Graph
- **Clic su cerchi città**: Apre vista spider per quel luogo
- **Ordinamento**: Elementi ordinati per sequenza, pagina, titolo o tipo
- **Interazione**: Clic sui nodi per aprire card dettaglio

## Roadmap

- [ ] Sistema di ricerca full-text
- [ ] Export delle visualizzazioni
- [ ] Modalità presentazione
- [ ] Integrazione con database esterno
- [ ] API REST per i dati
- [ ] Versione mobile app

## Crediti

Progetto sviluppato utilizzando i dati della Digital Library del Dipartimento di Filologia Classica e Italianistica dell'Università di Bologna.

## Ringraziamenti

- [Leaflet](https://leafletjs.com/) per la libreria di mappe
- [D3.js](https://d3js.org/) per le visualizzazioni
- [OpenStreetMap](https://www.openstreetmap.org/) per i dati cartografici
- [CartoDB](https://carto.com/) per i tile della mappa

## Contatti

- **Autore**: Lorenzo Sabatino
- **Email**: lorenzo.sabatino3@unibo.it
- **Progetto**:[[https://github.com/lnz-sbt3/atlante-promessi-sposi](https://github.com/lnz-sbt3/atlante-promessi-sposi)

---

**Nota**: Questo progetto è stato sviluppato per scopi didattici e di ricerca nell'ambito d'uso della Notte dei Ricercatori 2025
