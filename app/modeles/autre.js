deleteByKey = async (contract, key) => {
    let res = await contract.submitTransaction("deleteByKey",key);
    return res.length == 0 ? true : Buffer.from(res).toString();    
}

decrementerStock = async (contract, biereId, decrementNumber) => {
    let res = await contract.submitTransaction("decrementerStock", biereId, decrementNumber);
    return res.length == 0 ? true : Buffer.from(res).toString(); 
}
  

module.exports = {
    deleteByKey : deleteByKey,
    decrementerStock : decrementerStock
}