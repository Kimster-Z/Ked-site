# Site KED — mode d'emploi

Site vitrine statique (HTML, CSS, JavaScript), en trois langues : français (`/`), anglais (`/en/`) et luxembourgeois (`/lb/`).
Il n'a pas de base de données ni de cookies et ne charge aucun service tiers. Il s'héberge gratuitement sur GitHub Pages.

## Voir le site sur votre ordinateur

Double-cliquez sur `index.html`. Tout fonctionne en local, carte comprise.

## Ce que vous modifierez le plus souvent

### Les points de vente → `data/points-de-vente.js`

C'est le seul fichier à toucher pour la carte. Ouvrez-le avec le Bloc-notes ou VS Code, les instructions sont en haut du fichier.

- Pour **ajouter un point de vente**, copiez un bloc `{ ... }` et remplissez les champs.
- Pour obtenir les **coordonnées GPS**, faites un clic droit sur le lieu dans Google Maps, puis cliquez sur les deux nombres affichés en haut du menu : ils sont copiés.
- Le **canton** est facultatif : sans lui, il est calculé à partir des coordonnées. Indiquez-le pour les communes proches d'une frontière de canton ; le point est alors automatiquement placé à l'intérieur du bon canton sur la carte.
- Les horaires communs (boutiques Munhowen) sont définis une seule fois en haut de la liste (`MUNHOWEN_A`, `MUNHOWEN_B`…).
- Le champ `note` affiche une précision sur la fiche (ex. « Réservé aux étudiants »).

### Les événements → même fichier, section `KED_EVENEMENTS`

- Pour **ajouter un événement**, renseignez la date (`AAAA-MM-JJ`), l'heure, le titre, le lieu et la ville. Vous pouvez aussi ajouter une photo, à déposer dans `assets/img/evenements/` (format paysage conseillé).
- Le titre peut être traduit : `titre: { fr: "...", en: "...", lb: "..." }`.
- Un événement passé **disparaît tout seul** le lendemain. S'il n'y a aucun événement à venir, le site affiche « Pas d'événement à venir pour le moment… ».
- Un modèle de bloc à copier se trouve juste au-dessus de la liste (en commentaire).

### Les partenaires de la frise → même fichier, en haut

1. Déposez le logo en PNG, **blanc sur fond transparent**, dans `assets/img/partenaires/`.
2. Ajoutez une ligne dans `window.KED_PARTENAIRES`.

### Les textes du site → `tools/i18n.json`, puis régénération

Les textes des trois langues sont dans `tools/i18n.json`. Après modification, relancez la génération des pages : clic droit sur `tools/build.ps1` > **Exécuter avec PowerShell**. Ou, dans un terminal :

```
powershell -ExecutionPolicy Bypass -File tools\build.ps1
```

Le script réécrit les 6 pages (accueil et informations légales, × 3 langues), le `sitemap.xml` et les redirections.
Ne modifiez pas directement les fichiers `index.html` : ils seraient écrasés à la prochaine génération.

## Mise en ligne sur GitHub Pages

1. Créez un compte sur github.com, puis un dépôt **public** (par exemple `ked-site`). GitHub Pages est gratuit pour les dépôts publics.
2. Envoyez **le contenu** du dossier `site` à la racine du dépôt. Deux options :
   - **GitHub Desktop** : le plus simple pour les mises à jour suivantes.
   - **Glisser-déposer** sur la page du dépôt (*Add file > Upload files*).
3. Dans le dépôt, allez dans *Settings > Pages*, choisissez *Deploy from a branch*, branche `main`, dossier `/ (root)`, puis *Save*.
4. Le site est alors visible sur `https://VOTRE-COMPTE.github.io/ked-site/`. Vérifiez-le à cette adresse avant de toucher au domaine.

## Bascule du domaine ked.lu (de Wix vers GitHub)

Ne faites cette étape qu'une fois le site vérifié sur l'adresse github.io.

1. Dans GitHub, *Settings > Pages > Custom domain* : saisissez `www.ked.lu` puis *Save*.
2. Chez le gestionnaire DNS de ked.lu (aujourd'hui Wix, rubrique *Domaines > Gérer les enregistrements DNS*) :
   - Créez ou modifiez l'enregistrement **CNAME** `www` pour qu'il pointe vers `VOTRE-COMPTE.github.io`.
   - Remplacez les enregistrements **A** du domaine nu (`@`) par les quatre adresses de GitHub :
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
   - **Ne touchez pas** aux enregistrements **MX** ni aux **TXT** de Google Workspace : c'est votre messagerie contact@ked.lu.
3. Attendez la propagation (de quelques minutes à 24 h), puis cochez *Enforce HTTPS* dans GitHub.
4. Gardez votre abonnement Wix jusqu'à ce que tout fonctionne sur ked.lu, puis dépubliez le site Wix.

Les anciennes adresses Wix (`/boutique`, `/en/boutique`, `/informations-légales`…) redirigent automatiquement vers les nouvelles pages.

## À vérifier avant la mise en ligne

- [ ] Les textes luxembourgeois **nouveaux** ont été relus par un locuteur natif. Les textes déjà présents sur ked.lu ont été repris tels quels ; les nouveaux concernent les arguments, la carte, la frise et les libellés.
- [ ] La licence de la police **Sequel 100 Black** autorise l'usage web. Sur un site, les fichiers de police sont publics et téléchargeables.
- [ ] Les mentions légales mises à jour ont été validées. Points modifiés : hébergeur (GitHub au lieu de Wix), suppression des cookies Google Maps (la carte n'utilise plus Google, seuls les liens d'itinéraire ouvrent Google Maps), date de mise à jour. La version LB indiquait « A. Raulin » comme responsable de publication : elle a été alignée sur les versions FR et EN (Kimster Company).

## Organisation des fichiers

```
index.html, en/, lb/                pages générées (ne pas modifier à la main)
informations-legales/               mentions légales générées
data/points-de-vente.js             points de vente, événements, partenaires  ← à modifier
assets/css/style.css                styles
assets/js/app.js                    carte interactive, frise, animations
assets/js/cantons.js                contours des 12 cantons (généré)
assets/img/, assets/fonts/          images et polices
tools/                              textes (i18n.json), gabarits, script de génération
boutique/, informations-légales/    redirections des anciennes URL Wix
```
