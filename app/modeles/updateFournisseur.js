
updateProduit = async (contract, id, codebarre, biereNom, prixQuantite) => {
    let res = await contract.submitTransaction("putProduit", id, codebarre, biereNom, prixQuantite);
    return res.length == 0 ? true : Buffer.from(res).toString();  
}
  

module.exports = {
    updateProduit : updateProduit
 }