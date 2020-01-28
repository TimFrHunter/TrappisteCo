Test effecuté avec les pre-requis suivants :
node v8.16.2
npm 6.4.1
docker 19.03.2
docker-compose  1.13.0
Hyperledger images 1.4.4 

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
Le navigateur doit normalement se lancer. Dans le cas contraire, aller sur : http://localhost:3000 <br>

Deux identifiants sont proposés pour cet environnement :<br> 
ID: responsable - MDP: pwd<br>
ID: vendeur - MDP: pwd

<b>Conseil :</b><br>
Ouvrir deux navigateurs différents pour chaque utilisateur.<br>

Ainsi, vous aurez la possibilité de chercher les codes barres que vous souhaitez utiliser, directement avec le user responsable,
et ajouter les codes barre à la caisse avec le user vendeur.


<b>Fonctionnement de l'app:</b><br>
Lors de la validation d'achat à la caisse:
- le stock est décrémenté
- une vente est incrémentée
- si un ticket de reduction est utilisé, il est passé à false, et devient non utilisable

Lors de la validation de consigne à la caisse:
- le stock de consigne est incrémenté (sur plusieur ligne si plusieur consigne validée)

- un seul ticket de reduction est créé

<b>Infos:</b>
- 2 peers infra (CFT)
- 3 orderer mode RAFT, network CFT
