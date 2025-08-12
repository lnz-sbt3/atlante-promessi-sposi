# Atlante Illustrato dei Promessi Sposi

Una mappa interattiva per esplorare i luoghi e le illustrazioni dell'opera di Alessandro Manzoni.

## 🎯 Descrizione del Progetto

L'Atlante Illustrato dei Promessi Sposi è un'applicazione web interattiva che permette di visualizzare su mappa geografica i luoghi citati ne "I Promessi Sposi" e nella "Storia della Colonna Infame" di Alessandro Manzoni, correlati con le relative illustrazioni e contenuti multimediali.

## ✨ Caratteristiche Principali

- **Mappa Interattiva**: Visualizzazione geografica dei luoghi manzoniani
- **Timeline Dinamica**: Navigazione cronologica per capitoli
- **Filtri Avanzati**: Ricerca per capitoli, luoghi, autori, personaggi e pagine
- **Spider Graph**: Visualizzazione delle connessioni tra elementi dello stesso luogo
- **Card Informative**: Dettagli completi per ogni elemento
- **Breadcrumb System**: Gestione filtri attivi con URL persistenti
- **Design Responsivo**: Ottimizzato per desktop e dispositivi mobili

## 🚀 Demo

[Link alla demo live](https://your-username.github.io/atlante-manzoni)

## 🛠️ Tecnologie Utilizzate

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Mappe**: Leaflet.js
- **Visualizzazioni**: D3.js
- **Dati**: GeoJSON
- **Stile**: CSS Grid, Flexbox, Gradients

## 📁 Struttura del Progetto

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

## 🚀 Installazione e Avvio

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

## 📊 Formato Dati

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

## 🎮 Utilizzo

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

## 🔧 Personalizzazione

### Colori e Tema
Modifica le variabili CSS in `css/styles.css`:
```css
/* Palette colori principali */
--primary-color: #ffa500;
--secondary-color: #66a3ff;
--background-color: #1d2b2f;
```

### Dati Personalizzati
Sostituisci il file `data/dl_quarantana.geojson` con i tuoi dati seguendo lo stesso formato.

### Logo e Assets
Sostituisci `assets/AtlanteManzoni_Logo.png` con il tuo logo.

## 🤝 Contributi

I contributi sono benvenuti! Per contribuire:

1. Fork del progetto
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit delle modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📝 Roadmap

- [ ] Sistema di ricerca full-text
- [ ] Export delle visualizzazioni
- [ ] Modalità presentazione
- [ ] Integrazione con database esterno
- [ ] API REST per i dati
- [ ] Versione mobile app

## 🐛 Bug Report

Per segnalare bug, apri una [Issue](https://github.com/your-username/atlante-manzoni/issues) includendo:
- Descrizione del problema
- Passi per riprodurre
- Comportamento atteso vs attuale
- Screenshot se applicabile
- Informazioni browser/sistema

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT. Vedi il file `LICENSE` per dettagli.

## 🙏 Ringraziamenti

- [Leaflet](https://leafletjs.com/) per la libreria di mappe
- [D3.js](https://d3js.org/) per le visualizzazioni
- [OpenStreetMap](https://www.openstreetmap.org/) per i dati cartografici
- [CartoDB](https://carto.com/) per i tile della mappa

## 📧 Contatti

- **Autore**: [Il tuo nome]
- **Email**: [la tua email]
- **Progetto**: [https://github.com/your-username/atlante-manzoni](https://github.com/your-username/atlante-manzoni)

---

**Nota**: Questo progetto è stato sviluppato per scopi didattici e di ricerca nell'ambito degli studi manzoniani.