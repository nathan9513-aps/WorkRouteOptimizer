# 🚀 Guida Installazione WorkRouteOptimizer su Windows

## Prerequisiti

### 1. 📦 Installare Node.js
1. Vai su [nodejs.org](https://nodejs.org/)
2. Scarica la versione **LTS** (Long Term Support)
3. Esegui l'installer e segui le istruzioni
4. **IMPORTANTE**: Assicurati di spuntare "Add to PATH" durante l'installazione

### 2. ✅ Verificare l'installazione
Apri **PowerShell** o **Command Prompt** e digita:
```powershell
node --version
npm --version
```
Dovresti vedere le versioni installate (es. v18.17.0)

---

## 🔧 Installazione Progetto

### 1. 📁 Scaricare il progetto
```powershell
# Clona il repository (se hai git)
git clone https://github.com/username/WorkRouteOptimizer.git

# OPPURE scarica il ZIP dal repository e estrailo
```

### 2. 🚀 Installare le dipendenze
```powershell
# Naviga nella cartella del progetto
cd WorkRouteOptimizer

# Installa tutte le dipendenze
npm install
```

### 3. ⚙️ Configurazione ambiente (opzionale)
Crea un file `.env` nella root del progetto:
```env
# Password admin per reset ritardi (default: admin123)
ADMIN_PASSWORD=tuaPasswordPersonalizzata

# Porta del server (default: 3000)
PORT=3000
```

---

## 🎯 Avvio Applicazione

### Modalità Sviluppo
```powershell
# Avvia server di sviluppo
npm run dev
```

L'applicazione sarà disponibile su: **http://localhost:3000**

### Modalità Produzione
```powershell
# Compila il progetto
npm run build

# Avvia in produzione
npm start
```

---

## 🗂️ Struttura Progetto

```
WorkRouteOptimizer/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componenti UI
│   │   ├── pages/         # Pagine principali
│   │   └── hooks/         # Custom hooks
├── server/                # Backend Express
│   ├── index.ts           # Server principale
│   ├── routes.ts          # API endpoints
│   └── storage.ts         # Gestione dati
├── shared/                # Schemi condivisi
└── package.json           # Dipendenze e script
```

---

## 🔧 Risoluzione Problemi

### ❌ "npm non riconosciuto"
**Problema**: `npm : The term 'npm' is not recognized`

**Soluzione**:
1. Reinstalla Node.js da [nodejs.org](https://nodejs.org/)
2. Durante l'installazione, assicurati che "Add to PATH" sia spuntato
3. Riavvia PowerShell/Command Prompt
4. Verifica con `node --version`

### ❌ Errori di dipendenze
**Problema**: Errori durante `npm install`

**Soluzione**:
```powershell
# Pulisci cache npm
npm cache clean --force

# Cancella node_modules e package-lock.json
rm -rf node_modules
rm package-lock.json

# Reinstalla
npm install
```

### ❌ Porta già in uso
**Problema**: `Error: listen EADDRINUSE: address already in use :::3000`

**Soluzione**:
```powershell
# Trova processo che usa la porta 3000
netstat -ano | findstr :3000

# Termina il processo (sostituisci PID con il numero trovato)
taskkill /PID <PID> /F

# OPPURE usa una porta diversa
set PORT=3001
npm run dev
```

### ❌ Problemi di permessi
**Problema**: Errori di permessi durante installazione

**Soluzione**:
```powershell
# Esegui PowerShell come Amministratore
# Oppure configura npm per usare una cartella diversa
npm config set prefix %APPDATA%\npm
```

---

## 🎮 Come Usare l'Applicazione

### 1. 📋 Dashboard Principale
- Visualizza il task corrente
- Timer countdown in tempo reale
- Bottoni per confermare/segnalare ritardi

### 2. ⏰ Timer Intelligente
- **Verde**: Tempo normale rimanente
- **Arancione**: Meno di 10 minuti (urgente)
- **Rosso**: Timer negativo (in ritardo) - conta: -01:00, -02:00...

### 3. 🔄 Gestione Ritardi
- **Segnala Ritardo**: Marca task come ritardato
- **Conferma con Ritardo**: Conferma task anche se in ritardo
- **Reset Admin**: Rimuove tutti i ritardi (password: admin123)

### 4. 🛡️ Reset Amministratore
1. Clicca su "Reset Ritardi" 
2. Inserisci password admin (default: `admin123`)
3. Scegli se confermare task passati automaticamente
4. Il sistema rimuove solo i ritardi, mantiene orari originali

---

## 🔒 Sicurezza

### Password Admin
- **Default**: `admin123`
- **Personalizzazione**: Modifica nel file `.env`
- **Produzione**: CAMBIA SEMPRE la password di default!

### Dati
- Attualmente i dati sono salvati in memoria
- Per persistenza permanente, implementare database

---

## 📞 Supporto

### File di Log
I log del server sono visibili nella console dove hai eseguito `npm run dev`

### Debug
Per abilitare log dettagliati:
```powershell
set DEBUG=*
npm run dev
```

### Riavvio Rapido
```powershell
# Ferma il server con Ctrl+C
# Riavvia
npm run dev
```

---

## 🎯 Funzionalità Principali

✅ **Dashboard tempo reale**  
✅ **Timer negativo per ritardi**  
✅ **Gestione intelligente ritardi**  
✅ **Reset amministratore**  
✅ **Conferma task passati automatica**  
✅ **UI responsiva e intuitiva**  

---

## 📋 Checklist Installazione

- [ ] Node.js installato e funzionante
- [ ] Progetto scaricato/clonato
- [ ] `npm install` completato senza errori
- [ ] `npm run dev` avvia l'applicazione
- [ ] Applicazione accessibile su http://localhost:3000
- [ ] Dashboard carica correttamente
- [ ] Timer funziona e conta in tempo reale

🎉 **Installazione completata!** L'applicazione è pronta per l'uso.