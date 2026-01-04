# Instructions pour créer l'icône avec fond noir

Pour que le logo apparaisse avec un fond noir sur l'écran d'accueil iOS, vous devez créer une version du logo avec un fond noir intégré.

## Option 1 : Utiliser un outil en ligne

1. Allez sur https://www.favicon-generator.org/ ou https://realfavicongenerator.net/
2. Uploadez votre logo (`logo.png`)
3. Sélectionnez "Background color" : `#000000` (noir)
4. Téléchargez les icônes générées
5. Renommez l'icône 180x180 en `logo-black-bg.png`
6. Placez-la dans `src/assets/logo/`

## Option 2 : Utiliser Photoshop / GIMP / Canva

1. Ouvrez votre logo (`logo.png`)
2. Créez un nouveau document 180x180 pixels
3. Remplissez le fond en noir (#000000)
4. Placez votre logo centré sur le fond noir
5. Exportez en PNG : `logo-black-bg.png`
6. Placez-le dans `src/assets/logo/`

## Option 3 : Utiliser ImageMagick (ligne de commande)

```bash
# Créer une image 180x180 avec fond noir
magick -size 180x180 xc:black logo-black-bg.png

# Ajouter le logo centré
magick logo-black-bg.png logo.png -gravity center -composite logo-black-bg.png
```

## Taille recommandée

- **180x180 pixels** minimum (taille standard iOS)
- Format : PNG avec transparence (si le logo a des parties transparentes)
- Fond : Noir (#000000)

Une fois le fichier `logo-black-bg.png` créé et placé dans `src/assets/logo/`, l'icône apparaîtra avec un fond noir sur l'écran d'accueil iOS.

