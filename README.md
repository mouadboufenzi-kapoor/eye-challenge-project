# Eye Challenge — prototype de détection

Prototype technique de l'étape 2 : la caméra frontale est traitée localement par MediaPipe Face Landmarker pour afficher en direct `OUVERTS` ou `FERMÉS`. La vidéo n'est ni envoyée ni stockée. Aucun backend n'est utilisé.

## Lancer en local

```bash
npm install
npm run dev
```

La caméra fonctionne sur `localhost` ou en HTTPS. Pour le debug, ouvrir `/?debug=1`.

## Tester sur un téléphone

1. Déployer le dépôt sur **Cloudflare Pages** (build command `npm run build`, dossier de sortie `dist`) ou lancer un tunnel HTTPS vers le serveur Vite.
2. Pour un tunnel local, lancer `npm run dev -- --host` puis utiliser un outil gratuit comme `cloudflared tunnel --url http://localhost:5173`.
3. Ouvrir l'URL HTTPS sur l'iPhone ou Android et autoriser la caméra frontale.

Le modèle `face_landmarker.task` et les fichiers WASM sont versionnés dans `public/`, donc aucun CDN n'est requis au runtime.

## Seuils

Valeurs de départ : fermeture `0.50`, ouverture `0.35`, moyenne glissante de 6 frames à environ 30 FPS. Un état doit rester confirmé pendant 2 frames avant de changer, pour éviter les basculements rapides. La calibration place le seuil personnel plus près de la mesure réelle des yeux ouverts et conserve une hystérésis.
