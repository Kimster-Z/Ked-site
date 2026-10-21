/* ============================================================================
   KED — points de vente, événements et partenaires
   ----------------------------------------------------------------------------
   C'est LE fichier à modifier pour mettre à jour la carte, les événements
   et la frise des partenaires.
   Aucune autre modification de code n'est nécessaire.

   AJOUTER UN POINT DE VENTE : copier un bloc { ... }, le coller à la suite
   (sans oublier la virgule entre deux blocs) et remplir les champs.

   Champs :
     id          identifiant unique, sans espace ni accent   (ex. "cactus-strassen")
     nom         nom du point de vente                       (ex. "Cactus Strassen")
     type        boissons | foodtruck | lounge | sport | bar | restaurant |
                 epicerie | supermarche | station | evenement | autre
     adresse     numéro et rue                               (ex. "12 route d'Arlon")
     codePostal  code postal                                 (ex. "L-8008")
     ville       localité                                    (ex. "Strassen")
     canton      facultatif : clervaux, wiltz, vianden, diekirch, redange,
                 echternach, mersch, grevenmacher, capellen, luxembourg,
                 remich, esch-sur-alzette. Si absent, il est calculé à partir
                 des coordonnées.
     lat, lng    coordonnées GPS : sur Google Maps, clic droit sur le lieu,
                 cliquer sur les deux nombres en haut du menu pour les copier.
     telephone   facultatif                                  (ex. "+352 12 34 56")
     siteWeb     facultatif                                  (ex. "https://www.exemple.lu")
     horaires    facultatif. Une plage ("08:00-20:00"), plusieurs plages séparées
                 par " / " ("08:00-12:00 / 14:00-19:00"), ou "ferme".
                 Jours : lun, mar, mer, jeu, ven, sam, dim.
     note        facultatif : précision affichée sur la fiche. Un texte, ou
                 { fr: "...", en: "...", lb: "..." }
   ============================================================================ */

window.KED_PARTENAIRES = [
  { nom: "Munhowen",      logo: "assets/img/partenaires/munhowen.png" },
  { nom: "Pizza Lux Foodtruck", logo: "assets/img/partenaires/pizzalux.png" },
  { nom: "SAUL",          logo: "assets/img/partenaires/saul.png" },
  { nom: "Yucca Fitness Club", logo: "assets/img/partenaires/yucca.png" },
  { nom: "TotalEnergies",      logo: "assets/img/partenaires/totalenergies.png" },
  { nom: "Aral",               logo: "assets/img/partenaires/aral.png" },
  { nom: "BP",                 logo: "assets/img/partenaires/bp.png" },
  { nom: "Gulf",               logo: "assets/img/partenaires/gulf.png" }
];

/* ----------------------------------------------------------------------------
   ÉVÉNEMENTS (section « Retrouvez KED : »)
     date      jour de l'événement, au format AAAA-MM-JJ   (ex. "2026-11-21")
     dateFin   facultatif, pour un événement sur plusieurs jours
     heure     facultatif                                   (ex. "10:00-19:00")
     titre     nom de l'événement. Un texte, ou une traduction par langue :
               { fr: "Salon de la boisson", en: "Drinks fair", lb: "Gedrénksfoire" }
     lieu      salle ou lieu                                (ex. "Luxexpo The Box")
     ville     localité
     image     facultatif : photo du lieu ou de l'événement, à déposer dans
               assets/img/evenements/ (format paysage conseillé)
     lien      facultatif : page de l'événement (billetterie, Facebook…)
   Les événements passés disparaissent tout seuls le lendemain.
   S'il n'y a aucun événement à venir, un message « prochainement » s'affiche.
   ---------------------------------------------------------------------------- */

/* Exemple de bloc à copier entre les crochets ci-dessous :
  {
    id: "salon-boisson-2026",
    date: "2026-11-21", heure: "10:00-19:00",
    titre: { fr: "Salon de la boisson", en: "Drinks fair", lb: "Gedrénksfoire" },
    lieu: "Luxexpo The Box", ville: "Luxembourg-Kirchberg",
    image: "assets/img/evenements/salon-boisson.jpg"
  }
*/
window.KED_EVENEMENTS = [
];

/* ----------------------------------------------------------------------------
   POINTS DE VENTE
   ---------------------------------------------------------------------------- */

/* Horaires communs aux boutiques Munhowen (du lundi au samedi) */
var MUNHOWEN_A = { lun: "10:00-13:30 / 14:00-19:00", mar: "10:00-13:30 / 14:00-19:00", mer: "10:00-13:30 / 14:00-19:00", jeu: "10:00-13:30 / 14:00-19:00", ven: "10:00-13:30 / 14:00-19:00", sam: "10:00-13:30 / 14:00-19:00", dim: "ferme" };
var MUNHOWEN_B = { lun: "09:00-13:30 / 14:00-18:00", mar: "09:00-13:30 / 14:00-18:00", mer: "09:00-13:30 / 14:00-18:00", jeu: "09:00-13:30 / 14:00-18:00", ven: "09:00-13:30 / 14:00-18:00", sam: "09:00-13:30 / 14:00-18:00", dim: "ferme" };
var MUNHOWEN_C = { lun: "09:00-18:30", mar: "09:00-18:30", mer: "09:00-18:30", jeu: "09:00-18:30", ven: "09:00-18:30", sam: "09:00-18:30", dim: "ferme" };
var MUNHOWEN_D = { lun: "09:30-13:30 / 14:00-18:00", mar: "09:30-13:30 / 14:00-18:00", mer: "09:30-13:30 / 14:00-18:00", jeu: "09:30-13:30 / 14:00-18:00", ven: "09:30-13:30 / 14:00-18:00", sam: "09:30-13:30 / 14:00-18:00", dim: "ferme" };
var MUNHOWEN_E = { lun: "09:00-18:00", mar: "09:00-18:00", mer: "09:00-18:00", jeu: "09:00-18:00", ven: "09:00-18:00", sam: "09:00-18:00", dim: "ferme" };
var MUNHOWEN_F = { lun: "08:30-19:00", mar: "08:30-19:00", mer: "08:30-19:00", jeu: "08:30-19:00", ven: "08:30-19:00", sam: "08:30-19:00", dim: "ferme" };

var NOTE_FOODTRUCK = { fr: "Foodtruck : présent à cet endroit uniquement aux horaires indiqués.", en: "Food truck: at this spot only during the hours shown.", lb: "Foodtruck: just zu den uginnen Zäiten op dëser Plaz." };
var NOTE_ETUDIANTS = { fr: "Réservé aux étudiants.", en: "Students only.", lb: "Reservéiert fir Studenten." };

window.KED_POINTS = [

  /* ---- Yucca Fitness Club ---- */
  {
    id: "yucca-diekirch", nom: "Yucca Fitness Club", type: "sport",
    adresse: "14 Rue du Walebroch", codePostal: "L-9291", ville: "Diekirch", canton: "diekirch",
    lat: 49.8642579, lng: 6.1486096,
    horaires: { lun: "10:00-13:00 / 16:00-19:00", mar: "10:00-13:00 / 16:00-19:00", mer: "10:00-13:00 / 16:00-19:00", jeu: "10:00-13:00 / 16:00-19:00", ven: "10:00-13:00 / 16:00-19:00", sam: "ferme", dim: "ferme" }
  },

  /* ---- Pizza Lux (foodtruck : un emplacement par créneau) ---- */
  {
    id: "pizzalux-bettembourg", nom: "Pizza Lux Foodtruck — Bettembourg", type: "foodtruck", note: NOTE_FOODTRUCK,
    adresse: "Place de l'Église", codePostal: "L-3230", ville: "Bettembourg", canton: "esch-sur-alzette",
    lat: 49.518481, lng: 6.0952387,
    horaires: { lun: "18:00-20:30", mar: "ferme", mer: "ferme", jeu: "ferme", ven: "ferme", sam: "ferme", dim: "ferme" }
  },
  {
    id: "pizzalux-leudelange", nom: "Pizza Lux Foodtruck — Leudelange", type: "foodtruck", note: NOTE_FOODTRUCK,
    adresse: "Place du Lavoir", codePostal: "L-3358", ville: "Leudelange", canton: "esch-sur-alzette",
    lat: 49.5687131, lng: 6.0702129,
    horaires: { lun: "ferme", mar: "18:00-20:30", mer: "ferme", jeu: "ferme", ven: "ferme", sam: "ferme", dim: "ferme" }
  },
  {
    id: "pizzalux-strassen-edison", nom: "Pizza Lux Foodtruck — Strassen (Inspection sanitaire)", type: "foodtruck", note: NOTE_FOODTRUCK,
    adresse: "Inspection sanitaire, 2 Rue Thomas Edison", codePostal: "L-1445", ville: "Strassen", canton: "luxembourg",
    lat: 49.6212138, lng: 6.0958738,
    horaires: { lun: "ferme", mar: "ferme", mer: "11:30-13:30", jeu: "ferme", ven: "ferme", sam: "ferme", dim: "ferme" }
  },
  {
    id: "pizzalux-strassen-barble", nom: "Pizza Lux Foodtruck — Strassen (Centre Barblé)", type: "foodtruck", note: NOTE_FOODTRUCK,
    adresse: "Parking Centre Barblé, 70 Rue des Romains", codePostal: "L-8041", ville: "Strassen", canton: "luxembourg",
    lat: 49.6191893, lng: 6.0714422,
    horaires: { lun: "ferme", mar: "ferme", mer: "18:00-20:30", jeu: "ferme", ven: "18:00-20:45", sam: "ferme", dim: "ferme" }
  },
  {
    id: "pizzalux-bertrange", nom: "Pizza Lux Foodtruck — Bertrange", type: "foodtruck", note: NOTE_FOODTRUCK,
    adresse: "Rue de l'Industrie (en face du magasin Trafic)", codePostal: "L-8070", ville: "Bertrange", canton: "luxembourg",
    lat: 49.6111, lng: 6.0726,
    itineraire: "https://www.google.com/maps/dir/?api=1&destination=49.6111%2C6.0726",
    horaires: { lun: "ferme", mar: "ferme", mer: "ferme", jeu: "11:30-13:30", ven: "ferme", sam: "ferme", dim: "ferme" }
  },
  {
    id: "pizzalux-findel", nom: "Pizza Lux Foodtruck — Findel (Cité Policière)", type: "foodtruck", note: NOTE_FOODTRUCK,
    adresse: "Cité Policière, 1 A-F Rue de Trèves", codePostal: "L-2632", ville: "Findel", canton: "luxembourg",
    lat: 49.6238945, lng: 6.1913439,
    horaires: { lun: "ferme", mar: "ferme", mer: "ferme", jeu: "ferme", ven: "11:30-13:30", sam: "ferme", dim: "ferme" }
  },

  /* ---- Student Lounge (réservé aux étudiants) ---- */
  {
    id: "student-lounge-belval", nom: "Student Lounge — Belval", type: "lounge", note: NOTE_ETUDIANTS,
    adresse: "Maison des Arts et des Étudiants, Place de l'Université", codePostal: "L-4365", ville: "Esch-sur-Alzette", canton: "esch-sur-alzette",
    lat: 49.5038647, lng: 5.9484694
  },
  {
    id: "student-lounge-kirchberg", nom: "Student Lounge — Kirchberg", type: "lounge",
    note: { fr: "Réservé aux étudiants · campus Kirchberg, rez-de-chaussée.", en: "Students only · Kirchberg campus, ground floor.", lb: "Reservéiert fir Studenten · Campus Kirchberg, Rez-de-chaussée." },
    adresse: "6 Rue Richard Coudenhove-Kalergi", codePostal: "L-1359", ville: "Luxembourg-Kirchberg", canton: "luxembourg",
    lat: 49.626531, lng: 6.1590482
  },

  /* ---- Munhowen (9 boutiques) ---- */
  {
    id: "munhowen-bertrange", nom: "Munhowen — Bertrange", type: "boissons",
    adresse: "35 Route de Longwy", codePostal: "L-8080", ville: "Bertrange", canton: "luxembourg",
    lat: 49.6029941, lng: 6.0746917, horaires: MUNHOWEN_A
  },
  {
    id: "munhowen-esch", nom: "Munhowen — Esch-sur-Alzette", type: "boissons",
    adresse: "9 Place des Sacrifiés 1940-1945", codePostal: "L-4115", ville: "Esch-sur-Alzette", canton: "esch-sur-alzette",
    lat: 49.5001541, lng: 5.9773944, horaires: MUNHOWEN_B
  },
  {
    id: "munhowen-foetz", nom: "Munhowen — Foetz", type: "boissons",
    adresse: "2 Rue de l'Industrie", codePostal: "L-3895", ville: "Foetz (Mondercange)", canton: "esch-sur-alzette",
    lat: 49.5249408, lng: 6.0123102, horaires: MUNHOWEN_C
  },
  {
    id: "munhowen-ingeldorf", nom: "Munhowen — Ingeldorf", type: "boissons",
    adresse: "43 Z.I. Im Schafspfad", codePostal: "L-9099", ville: "Ingeldorf", canton: "diekirch",
    lat: 49.8532419, lng: 6.1340641, horaires: MUNHOWEN_D
  },
  {
    id: "munhowen-marnach", nom: "Munhowen — Marnach", type: "boissons",
    adresse: "15 Rue de Marbourg", codePostal: "L-9764", ville: "Marnach", canton: "clervaux",
    lat: 50.0535944, lng: 6.0621006, horaires: MUNHOWEN_E
  },
  {
    id: "munhowen-rodange", nom: "Munhowen — Rodange", type: "boissons",
    adresse: "408 Route de Longwy", codePostal: "L-4832", ville: "Rodange", canton: "esch-sur-alzette",
    lat: 49.5463501, lng: 5.8212751, horaires: MUNHOWEN_F
  },
  {
    id: "munhowen-sandweiler", nom: "Munhowen — Sandweiler", type: "boissons",
    adresse: "Rue de Luxembourg – Op der Hokaul", codePostal: "L-5230", ville: "Sandweiler", canton: "luxembourg",
    lat: 49.6151207, lng: 6.2074501, horaires: MUNHOWEN_E
  },
  {
    id: "munhowen-soleuvre", nom: "Munhowen — Soleuvre", type: "boissons",
    adresse: "5 Place de l'Indépendance", codePostal: "L-4418", ville: "Soleuvre", canton: "esch-sur-alzette",
    lat: 49.5220944, lng: 5.9370884, horaires: MUNHOWEN_B
  },
  {
    id: "munhowen-steinfort", nom: "Munhowen — Steinfort", type: "boissons",
    adresse: "26 Route d'Arlon", codePostal: "L-8410", ville: "Steinfort", canton: "capellen",
    lat: 49.6591348, lng: 5.9106271, horaires: MUNHOWEN_C
  },

  /* ---- Stations-service partenaires ---- */
  {
    id: "total-contern", nom: "TotalEnergies — Contern", type: "station",
    adresse: "4 Rue Daniel Grün", codePostal: "L-5315", ville: "Contern", canton: "luxembourg",
    lat: 49.5953722, lng: 6.2134424
  },
  {
    id: "total-howald", nom: "TotalEnergies — Howald", type: "station",
    adresse: "Rangwee", codePostal: "L-2723", ville: "Howald", canton: "luxembourg",
    lat: 49.5878643, lng: 6.1379462,
    itineraire: "https://www.google.com/maps/dir/?api=1&destination=49.5878643%2C6.1379462",
    horaires: { lun: "06:00-22:00", mar: "06:00-22:00", mer: "06:00-22:00", jeu: "06:00-22:00", ven: "06:00-22:00", sam: "07:00-20:00", dim: "ferme" }
  },
  {
    id: "aral-dudelange", nom: "Aral — Dudelange", type: "station",
    adresse: "106 Route de Luxembourg", codePostal: "L-3515", ville: "Dudelange", canton: "esch-sur-alzette",
    lat: 49.4900107, lng: 6.0833972,
    horaires: { lun: "06:00-22:00", mar: "06:00-22:00", mer: "06:00-22:00", jeu: "06:00-22:00", ven: "06:00-22:00", sam: "06:00-22:00", dim: "06:00-22:00" }
  },
  {
    id: "aral-friedhaff", nom: "Aral — Friedhaff", type: "station",
    adresse: "Pack Up Friedhaff, N27A", codePostal: "L-9379", ville: "Diekirch", canton: "diekirch",
    lat: 49.8846098, lng: 6.1361673,
    itineraire: "https://www.google.com/maps/dir/?api=1&destination=49.8846098%2C6.1361673"
  },
  {
    id: "bp-capellen", nom: "BP — Aire de Capellen", type: "station",
    note: { fr: "Aire d’autoroute A6, sens Belgique → Luxembourg.", en: "A6 motorway rest area, direction Belgium → Luxembourg.", lb: "Raschtplaz op der A6, Richtung Belsch → Lëtzebuerg." },
    adresse: "Aire de Capellen (A6)", codePostal: "L-8345", ville: "Holzem", canton: "capellen",
    lat: 49.6354035, lng: 5.9702452,
    itineraire: "https://www.google.com/maps/dir/?api=1&destination=49.6354035%2C5.9702452",
    horaires: { lun: "00:00-24:00", mar: "00:00-24:00", mer: "00:00-24:00", jeu: "00:00-24:00", ven: "00:00-24:00", sam: "00:00-24:00", dim: "00:00-24:00" }
  },
  {
    id: "gulf-mertzig", nom: "Gulf — Mertzig", type: "station",
    adresse: "Rue Principale", codePostal: "L-9166", ville: "Mertzig", canton: "diekirch",
    lat: 49.8376918, lng: 6.0133133,
    itineraire: "https://www.google.com/maps/dir/?api=1&destination=49.8376918%2C6.0133133",
    horaires: { lun: "06:00-22:00", mar: "06:00-22:00", mer: "06:00-22:00", jeu: "06:00-22:00", ven: "06:00-22:00", sam: "07:00-22:00", dim: "08:00-13:00" }
  }
];
