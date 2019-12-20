sur simple network: 1 peer 1 orderer 1 channel 1 chainCode 1 clientApp va falloir utilisé couh db ??? essaye sans pour voir.


=============================================================
CHAINECODE
=============================================================
Vars:
- struct biere (id, nom, stock, codeBarre, consignePrix, prix)
- struct ticketReduction (id, reductionPrix, codeBarre, isAvalaible(bool:true/false))
- struct consigne (id, idBiere, IntegerNombreConsigné)
- struct vente(id, IdReudction, dateTimestamp, [idBiere => IntegerNombreDeBiereVendu], FloatPrixTotal)


Fonctionnalité: 
- DONE incrémenter stock(apres plus utile sera fait par le fournisseur)
- DONE decrémenter stock
- DONE incrementer vente
- DONE afficher lister infoBiere(struct Biere dont le stock)
- DONE afficher lister le nombre de vente(structVente)
- DONE incrementer un ticketReduction
- DONE afficher lister infoTicketReduction( strut ticketReduction dont isAvalaible ou pas, donc ceux qui ont été créés) 
- DONE desactiver ticketReduction
- DONE incrementer consigne
- DONE afficher lister consignes

=============================================================
APP
=============================================================
//Fct depuis clientAPP Employer
- achat fct() voir action a faire dans ClientApp achat()
- consigner fct () idem
//Fct depuis clientAPP Responsable
check CLIENTAPP Responsale 


ClientAPP Employer(caissier):
- scann system à faire ou entrer code barre dans input au debut et en cas de probleme 
- achat fct():
    - deduire réduction du prix
    - attendre de scanner toute les bieres et d'appuyer sur valider la commande avant d'envoyer la tx 
    - decrementer stock
    - créer une struct vente dans le ledger
    - editer un ticket de caisse avec en papier (idVente, nomBiere nombreBiere prixBiereUnitaire prixBiereTotal, (optionnelReductionPrix), prixTotal(Appliquer Prix reduction si exisite))
- consigner fct():
    - incrémenter consigne 
    - créer un ticketReduction


ClientAPP Responsable:
- liste stock biere
- liste vente
- liste bouteilles consignée
- liste ticket De Réduction
- incrementer stock ...

============================================================
Permission DROITS d'acces aux fonctions
=============================================================
à faire




*******************************************************
*******************************************************

NEGOCIATION
M1 Negocie avec le fournisseur F1
M1 Achete/Paye chez F1

STOCKAGE ET PRICING
M1 recoit biere ORVAL de F1
M1 incremente le stock biere ORVAL et fixe prix et consigne à l'unité 

VENTE
APP vend et décremente 10 bieres ORVAL
Si ticket de reductions(grace a des bouteilles consignées), 
    application de la reduction au moment de la vente 
    et desactivation de l'identifiant du ticket de reduction 

CONSIGNÉ
APP incremente 10 Bieres ORVAL consignées 
generation d'un ticket de réduction avec identifiant unique 






M1 Negocie avec le fournisseur F2
M1 Achete/Paye chez F2
M1 recoit biere Chimay Bleu de F2
M1 incremente le stock biere Chimay Bleu
APP vend et décremente 6 bieres Chimay Bleu




