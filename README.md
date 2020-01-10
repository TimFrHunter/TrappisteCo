Test effecuté avec les pre-requis suivants :
node v8.16.2
npm 6.4.1
docker 19.03.2
docker-compose  1.13.0

Installer les images Docker en executant :
./getDockerImages.sh

Aller dans ./app/ et lancer npm install dans un terminal

Demarrer Hyperledger environnement :
./main.sh up

Eteindre Hyperledger environnement :
./main.sh down

Utilisation :
Le navigatoire doit normalement se lancer. Dans le cas contraire, aller sur : http://localhost:3000

Deux identifiants sont proposés pour cet environnement : 
ID: responsable1 - MDP: pwd
ID: vendeur1 - MDP: pwd

Conseil :
Ouvrir deux navigateurs (ou onglets) différents pour chaque utilisateur.
Ainsi, vous aurez possibilité de chercher les codes barres, que vous souhaitez utiliser directement avec le user responsable1,
et ajouter les codes barre à la caisse avec le user vendeur1.
