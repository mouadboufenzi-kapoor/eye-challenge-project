# Eye Challenge — prototype de détection

Prototype technique de l'étape 2 : la caméra frontale est traitée localement par MediaPipe Face Landmarker pour afficher en direct `OUVERTS` ou `FERMÉS`. La vidéo n'est ni envoyée ni stockée. Aucun backend n'est utilisé.

## Lancer en local

```bash
npm install
npm run dev
```

La caméra fonctionne sur `localhost` ou en HTTPS. Pour le debug, ouvrir `/?debug=1`.

Les tests du moteur de jeu se lancent avec :

```bash
npm test
```

Le moteur reste séparé de l'interface et de MediaPipe. `src/game/controller.ts`
fait uniquement le lien entre un `EyeTracker` et le moteur, avec un scheduler
injectable pour garder les tests déterministes.

## Tester sur un téléphone

### Option recommandée : Cloudflare Pages

1. Dans Cloudflare Pages, choisir **Create a project** puis connecter le dépôt GitHub.
2. Choisir le framework **Vite**.
3. Utiliser `npm run build` comme commande de build et `dist` comme dossier de sortie.
4. Ouvrir l'URL HTTPS fournie par Cloudflare sur l'iPhone ou Android.

### Option rapide : tunnel local

1. Lancer `npm run dev:mobile`.
2. Dans un second terminal, lancer `cloudflared tunnel --url http://localhost:5173`.
3. Ouvrir l'URL HTTPS affichée par `cloudflared` sur le téléphone.

Ne pas utiliser une adresse `http://192.168...` pour la caméra : les navigateurs mobiles exigent HTTPS, sauf sur `localhost`.

### Checklist de test mobile

- [ ] La page s'ouvre en portrait sur iPhone.
- [ ] La page s'ouvre en portrait sur Android.
- [ ] L'autorisation de caméra frontale apparaît.
- [ ] La calibration fonctionne sans aperçu vidéo visible.
- [ ] Le visage est détecté avec une lumière normale.
- [ ] Les yeux restent stables ouverts/fermés pendant les mouvements légers.
- [ ] Un clignement naturel ne déclenche pas immédiatement une défaite.
- [ ] Le bouton Recommencer fonctionne après une défaite ou une victoire.

Le modèle `face_landmarker.task` et les fichiers WASM sont versionnés dans `public/`, donc aucun CDN n'est requis au runtime.

Le meilleur score est enregistré uniquement dans le `localStorage` du navigateur.

## Seuils

Valeurs de départ : fermeture `0.50`, ouverture `0.35`, moyenne glissante de 6 frames à environ 30 FPS. Un état doit rester confirmé pendant 2 frames avant de changer, pour éviter les basculements rapides. La calibration place le seuil personnel plus près de la mesure réelle des yeux ouverts et conserve une hystérésis.
