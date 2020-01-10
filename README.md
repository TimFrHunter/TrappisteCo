Test effecuté avec les pre-requis suivants:
node v8.16.2
npm 6.4.1
docker 19.03.2
docker-compose  1.13.0

Il faut installer les images dockers en executant :
./getDockerImages.sh

Il faut aller dans ./app/ et faire un npm install

Demarrer hyperledger environnement:
./main.sh up

Eteindre hyperledger environnement:
./main.sh down

Utilisation:
Normalement votre navigateur s'ouvre, si c'est pas le cas go : http://localhost:3000
les identifiants de connexions: 
responsable1 : pwd
vendeur1 : pwd

Conseil:
ouvrer deux navigateurs pour chaque utilisateur, ainsi vous pourrez aller chercher les codes barres que vous voulez utiliser directement avec le user responsable1
et avec le user vendeur1 ajouter les code barres à la caisse



