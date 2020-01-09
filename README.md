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


Une fois demarré dans ./web/
faire: node actions.js
ensuite ouvrir ce fichier pour tester des requests
