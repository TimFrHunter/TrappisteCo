Test effecuté avec les pre-requis suivants :
node v8.16.2
npm 6.4.1
docker 19.03.2
docker-compose  1.13.0

<b>Installation :</b><br>
- Télécharger le repository Github :<br>
git clone https://github.com/TimFrHunter/TrappisteCo.git <br>

- Installer les images Docker en executant :<br>
./getDockerImages.sh

- Aller dans ./app/ et lancer npm install dans un terminal

- Revenir sur dossier parent :<br>
cd ..<br>

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

<b>Fonctionnement de l'app:</b><br>
Lors de la validation d'achat à la caisse:
- le stock est décrémenté
- une vente est incrémentée
- si un ticket de reduction est utilisé, il est passé à false, et devient non utilisable

Lors de la validation de consigne à la caisse:
- le stock de consigne est incrémenté (sur plusieur ligne si plusieur consigne validée)
- un ticket de reduction est créé

Infos:
- 2 peers infra (CFT)
- 3 orderer mode RAFT, network CFT