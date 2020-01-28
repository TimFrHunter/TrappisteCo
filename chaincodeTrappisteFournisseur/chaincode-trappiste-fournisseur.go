package main

import (
	//"bytes"
	"encoding/json"

	"bytes"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/hyperledger/fabric/protos/peer"
	//"github.com/hyperledger/fabric/core/chaincode/shim/ext/cid"
)

type Commande struct {
	Id           string  `json:"id"`
	BiereNom     string  `json:"bierenom"`
	Quantite     int     `json:"quantite"`
	PrixUnitaire float32 `json:"prixunitaire"`
	PrixTotal    float32 `json:"consigne"`
}

/**
**/
type Produit struct {
	Id              string              `json:"id"`
	BiereNom        string              `json:"bierenom"`
	PrixParQuantite map[int]interface{} `json:"prixparquantite"` // [1] = 2.3 // [100] = 2.1 // [200] = 1.9
}

type TFContract struct{}

/********************************************************
	DEFAULT/ PRE REQUIS FUNCTION FOR ACCESS TO PEER LEDGER
*********************************************************/
func (tfc *TFContract) Init(stub shim.ChaincodeStubInterface) peer.Response {
	return shim.Success(nil)
}

//Routeur de fonctions
func (tfc *TFContract) Invoke(stub shim.ChaincodeStubInterface) peer.Response {

	function, args := stub.GetFunctionAndParameters()
	if function == "putProduit" {
		return tfc.putProduit(stub, args)
	} else if function == "getByKey" {
		return tfc.getByKey(stub, args)
	} else if function == "getByRange" {
		return tfc.getByRange(stub, args)
	}
	return shim.Error("Invalid Trappiste Contract function name.")
}

func (tfc *TFContract) putProduit(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	var id string = args[0]
	var biereNom string = args[1]
	var prixParQuantite map[int]interface{}

	err := json.Unmarshal([]byte(args[2]), &prixParQuantite) //"{\"1\" : \"2;3\", \"100\" : \"2.1\"}" etc..
	if err != nil {
		return shim.Error(err.Error())
	}

	produitStruct := Produit{id, biereNom, prixParQuantite} // hydate struct avec args

	produitAsByte, err := json.Marshal(produitStruct) //encode
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(id, produitAsByte) //write in ledger (key, value) aka (id, structData)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

func (tfc *TFContract) getByKey(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	resultAsByte, err := stub.GetState(args[0])
	if err != nil {
		return shim.Error("getState failed check")
	}
	return shim.Success(resultAsByte)
}

func (tfc *TFContract) getByRange(stub shim.ChaincodeStubInterface, args []string) peer.Response {
	var startRange string = args[0]
	var endRange string = args[1]
	var buffer bytes.Buffer
	resultsIterator, err := stub.GetStateByRange(startRange, endRange)
	if err != nil {
		return shim.Error("Pas de resultat trouvé")
	}

	// buffer is a JSON array containing QueryResults

	buffer.WriteString("[")

	firstTimeInLoop := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error("Pas de resultat trouvé dans l'iterateur ")
		}
		// Add a comma before array members, suppress it for the first array member
		if firstTimeInLoop == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		firstTimeInLoop = true
	}
	buffer.WriteString("]")

	resultsIterator.Close()

	return shim.Success(buffer.Bytes())
}

/********************************************************
	INIT WITH MAIN()
*********************************************************/
func main() {
	//initialisation
	err := shim.Start(new(TFContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
