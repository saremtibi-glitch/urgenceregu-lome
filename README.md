# UrgenceRégu Lomé 🚑

**Régulation des urgences médicales et orientation des accidentés à Lomé (Togo), en temps réel.**

Un témoin d'accident décrit la situation sur son téléphone. **Agbe AI**, l'assistant de régulation,
évalue la gravité et recommande l'hôpital adapté **le plus proche qui a de la place**. L'hôpital
accepte, une ambulance part, et le témoin suit son arrivée sur la carte en discutant avec l'équipe.

> Projet réalisé pendant le hackathon **Hacktoberfest 2026 de Python Togo** (Lomé, 24 octobre 2026).
> IA à poids ouverts : **Gemma 4**. Licence : [MIT](LICENSE).

## Le problème

À Lomé, un blessé est souvent conduit vers un hôpital saturé ou sans le service nécessaire :
des minutes précieuses sont perdues à chercher un autre établissement. Les témoins ne savent
pas quel hôpital peut le recevoir, ni quels gestes faire en attendant.

## Ce que fait l'application

| Espace | Adresse | Pour qui |
|---|---|---|
| Témoin | `/` | Toute personne présente sur un accident |
| Hôpital | `/hopital` | Équipe des urgences de chaque établissement |
| Ambulance | `/ambulance` | Chauffeur, sur son téléphone pendant le trajet |
| Administration | `/admin` | Équipe de régulation |

**Témoin**
- Description écrite ou **dictée à la voix** ; position GPS ou choix sur la carte.
- Analyse de la gravité par Agbe AI (avec repli par mots-clés si l'IA ne répond pas).
- Hôpitaux recommandés selon la spécialité, la disponibilité publiée **et la distance**.
- Gestes de premiers secours en attendant l'ambulance.
- Suivi en direct : réponse de l'hôpital, véhicule envoyé, ambulance sur la carte, discussion.
- Bouton **Appeler les secours** (118 pompiers, 117/161 police, 172 gendarmerie), même sans Internet.
- Interface en français, **éwé** (brouillon) et kabiyè (à compléter).
- Installable sur le téléphone (PWA), pages disponibles hors connexion.

**Hôpital**
- Publication de la disponibilité (disponible, limité, saturé, lits libres) et rappel si elle date de plus d'une heure.
- Alertes avec sirène, acceptation ou refus motivé, choix de l'ambulance envoyée.
- Gestion de la **flotte d'ambulances** (ajout, retrait, véhicules en mission).
- Signalement des **fausses alertes** ; les antécédents d'un numéro sont affichés sans jamais bloquer une alerte.

**Ambulance**
- Chaque téléphone choisit son véhicule et ne voit que ses missions et les missions libres.
- Partage GPS en direct, itinéraire, étapes « sur place » et « patient arrivé ».
- Messages lus à voix haute pendant la conduite.

**Administration**
- Indicateurs : délais de réponse et d'arrivée, taux d'acceptation, fausses alertes, flotte, alertes par heure.
- Export Excel (CSV) des alertes, gestion des hôpitaux, comptes et lieux.

## L'IA à poids ouverts au cœur du projet : Gemma 4

« Agbe AI » est le nom affiché aux utilisateurs ; le modèle qui travaille derrière est **Gemma 4**
(`gemma-4-26b-a4b-it`, modèle à poids ouverts de Google), appelé depuis `backend/gemma.py`.

- **Analyse du signalement** (`analyser`) : à partir de la description libre du témoin (écrite ou dictée),
  Gemma 4 renvoie une réponse JSON structurée : gravité (urgence vitale, urgent, modéré), diagnostic
  d'orientation, indices relevés dans le texte, spécialités nécessaires et gestes de premiers secours.
- **Orientation** : les spécialités demandées par Gemma 4 sont croisées avec les services, la disponibilité
  publiée et la distance de chaque hôpital pour recommander les plus adaptés.
- **Réévaluation en direct** (`reevaluer`) : quand le témoin écrit pendant l'attente (« la victime a perdu
  connaissance »), Gemma 4 réévalue la gravité et l'hôpital est prévenu si elle augmente.
- **Fiabilité** : chaque réponse est validée (champs, longueurs, valeurs permises). Si le modèle ne répond pas
  ou s'il n'y a pas d'Internet, un repli par mots-clés prend le relais : une alerte n'est jamais bloquée.

Le modèle se change sans toucher au code avec la variable `GEMMA_MODELE` dans `backend/.env`.

## Assistants de programmation IA

Conformément au règlement du hackathon, voici les assistants IA utilisés :

- **Microsoft Copilot** : pour affiner l'idée de départ et l'enrichir (besoins des témoins, des hôpitaux
  et des ambulances à Lomé).
- **Cursor** (éditeur de code avec agent IA) : pour l'écriture du code, la relecture, les tests et la
  documentation.

Toutes les décisions (fonctionnalités, données de Lomé, choix de conception) ont été prises et vérifiées
par l'équipe.

## Sécurité et vie privée

- Mots de passe stockés en empreinte PBKDF2 (jamais en clair), sessions de 12 h.
- Limites anti-abus : 8 alertes par appareil et 5 par numéro en 15 min ; 8 essais de connexion ratés.
- Le numéro du témoin n'est visible que par l'hôpital choisi et son ambulance, puis **effacé après 30 jours**
  (conservé 1 an seulement en cas de fausse alerte).
- Avertissement tant que des comptes gardent le mot de passe de démonstration.

## Installation

Prérequis : **Python 3.11 ou plus récent**.

```bash
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r backend\requirements.txt    # Windows
# ou : .venv/bin/pip install -r backend/requirements.txt              # Linux / macOS
```

Facultatif, pour activer Agbe AI : copiez `backend/.env.example` en `backend/.env` et collez une clé
gratuite de [Google AI Studio](https://aistudio.google.com/apikey).

Lancement : double-cliquez sur `demarrer.bat` (Windows) ou :

```bash
.venv\Scripts\python.exe backend\main.py
```

- Ordinateur : <http://localhost:8090>
- Téléphone sur le même Wi-Fi : `https://<adresse-du-PC>:8443` (acceptez l'avertissement : certificat local,
  nécessaire pour le GPS et la dictée).

Comptes de démonstration : chaque hôpital (identifiant = code de l'hôpital, ex. `chu-so`) avec le mot de
passe `lome2026` ; administrateur `admin` / `admin2026`. **Changez-les avant toute utilisation réelle.**

## Scénario de démonstration (5 minutes)

Avant de commencer : arrêtez le serveur, lancez `.venv\Scripts\python.exe backend\reinitialiser_demo.py`,
puis redémarrez. Ouvrez trois onglets (ou trois appareils) : témoin, hôpital `chu-so`, ambulance `chu-so`.

1. **Le problème** (30 s) — Montrez la carte des hôpitaux : certains sont saturés, le témoin ne peut pas le deviner.
2. **Le signalement** (1 min) — Côté témoin, touchez l'exemple « Accident de moto » ou dictez la description,
   puis « Analyser l'urgence ». Agbe AI classe la gravité et recommande les hôpitaux proches et disponibles.
3. **L'alerte** (1 min) — « Envoyer l'alerte » au CHU Sylvanus Olympio, saisissez un numéro (ex. 90 12 34 56).
   Côté hôpital, la sirène retentit : choisissez « Ambulance 2 » puis acceptez.
4. **Le suivi** (1 min 30) — Le témoin voit « Ambulance 2 » en route sur la carte. Envoyez le message rapide
   « La victime a perdu connaissance » : Agbe AI relève la gravité et l'hôpital est alerté.
   Côté ambulance, « Prendre cette mission » puis « Arrivé sur place ».
5. **Pilotage** (1 min) — Dans `/admin`, montrez les délais, la flotte, les alertes par heure et l'export Excel.
   Terminez sur le bouton « Appeler les secours » et la version en éwé.

## Tests

```bash
.venv\Scripts\python.exe -m pip install -r backend\requirements-dev.txt
.venv\Scripts\python.exe -m pytest tests
```

Les tests utilisent une base temporaire : ils ne touchent pas aux données de démonstration.

## Architecture

```
index.html, hopital.html, ambulance.html, admin.html   pages (HTML/CSS/JS sans framework)
commun/            code partagé (outils, dictée, appel des secours, traductions du témoin)
donnees/           hôpitaux et lieux de Lomé (JSON, source unique)
sw.js, manifest-*  application installable et hors ligne
backend/main.py    API FastAPI, WebSocket temps réel, sécurité
backend/gemma.py   Agbe AI (modèle Gemma via Google AI Studio) et repli par mots-clés
backend/ambulance.py  trajets routiers (OSRM) et simulation d'ambulance
backend/database.py   SQLite : schéma, migrations, données de démonstration
tests/             tests automatiques (pytest)
```

## Limites connues

- Les traductions éwé et kabiyè doivent être validées par des locuteurs natifs ; les conseils médicaux restent en français.
- Les disponibilités dépendent de la mise à jour par les hôpitaux (d'où le rappel horaire).
- Agbe AI aide à orienter mais **ne remplace pas un médecin régulateur**.

## Licence

Code publié sous licence [MIT](LICENSE) : libre d'utilisation, de modification et de redistribution.
Une [traduction française](LICENCE.fr.md) est fournie pour information ; seule la version anglaise fait foi.
