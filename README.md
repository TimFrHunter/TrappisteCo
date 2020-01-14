Test effecuté avec les pre-requis suivants :
node v8.16.2
npm 6.4.1
docker 19.03.2
docker-compose  1.13.0

<b>Installation :</b><br>
- Installer les images Docker en executant :<br>
./getDockerImages.sh

- Aller dans ./app/ et lancer npm install dans un terminal

- Demarrer Hyperledger environnement :<br>
./main.sh up

- Eteindre Hyperledger environnement :<br>
./main.sh down

<b>Utilisation :</b><br>
Le navigatoire doit normalement se lancer. Dans le cas contraire, aller sur : http://localhost:3000 <br>

Deux identifiants sont proposés pour cet environnement :<br> 
ID: responsable1 - MDP: pwd<br>
ID: vendeur1 - MDP: pwd

<b>Conseil :</b><br>
Ouvrir deux navigateurs différents pour chaque utilisateur.<br>
Ainsi, vous aurez possibilité de chercher les codes barres, que vous souhaitez utiliser directement avec le user responsable1,
et ajouter les codes barre à la caisse avec le user vendeur1.


Ajout:
le 14/01:
  - correction lors de l'achat de l'incrementation des ventes OK
  - ajout d'un second peer devient (CFT)
  - ajout de deux orderer mode RAFT ce qui rend le network CFT
