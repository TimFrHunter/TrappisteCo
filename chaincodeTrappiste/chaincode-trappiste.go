package main

import (
	"bytes"
	"crypto/x509"
	"encoding/json"
	"strings"

	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/hyperledger/fabric/protos/peer"

	"github.com/hyperledger/fabric/core/chaincode/shim/ext/cid"
)

type Biere struct {
	Id        string  `json:"id"`
	Nom       string  `json:"nom"`
	Stock     int     `json:"stock"`
	CodeBarre int     `json:"codebarre"`
	Consigne  float32 `json:"consigne"` // prix de la consigne
	Prix      float32 `json:"prix"`     // prix de la biere
	//	IsLivrer  bool
}

type Vente struct {
	Id          string         `json:"id"`
	IdReduction string         `json:"idreduction"`
	Date        int            `json:"date"`       //timestamp format
	BiereVendu  map[string]int `json:"bierevendu"` //format: {"biere1" : 6, "biere2" : 12}
	PrixTotal   float32        `json:"prixtotal"`
}

type TicketReduction struct {
	Id            string  `json:"id"`
	ReductionPrix float32 `json:"reductionprix"`
	CodeBarre     int     `json:"codebarre"`
	IsEnabled     bool    `json:"isenabled"`
}

type Consigne struct {
	Id      string `json:"id"`
	IdBiere string `json:"idbiere"`
	Count   int    `json:"count"` //nb de bieres consignés
}

type TrappisteContract struct{} //Struct contenant toute les autres fonctions, elle init dans le main()

/********************************************************
	DEFAULT/ PRE REQUIS FUNCTION FOR ACCESS TO PEER LEDGER
*********************************************************/
func (tc *TrappisteContract) Init(stub shim.ChaincodeStubInterface) peer.Response {
	return shim.Success(nil)
}

//Routeur de fonctions
func (tc *TrappisteContract) Invoke(stub shim.ChaincodeStubInterface) peer.Response {

	// Retrieve the requested Smart Contract function and arguments
	function, args := stub.GetFunctionAndParameters()
	// Route to the appropriate handler function to interact with the right ledger
	if function == "incrementerStock" {
		return tc.incrementerStock(stub, args)
	} else if function == "afficherBiereUnique" {
		return tc.afficherBiereUnique(stub, args)
	} else if function == "listerBieres" {
		return tc.listerBieres(stub, args)
	} else if function == "decrementerStock" {
		return tc.decrementerStock(stub, args)
	} else if function == "incrementerVente" {
		return tc.incrementerVente(stub, args)
	} else if function == "listerVente" {
		return tc.listerVente(stub, args)
	} else if function == "incrementerTicketDeReduction" {
		return tc.incrementerTicketDeReduction(stub, args)
	} else if function == "listerTicketReduction" {
		return tc.listerTicketReduction(stub, args)
	} else if function == "desactiverTicketDeReduction" {
		return tc.desactiverTicketDeReduction(stub, args)
	} else if function == "incrementerConsigne" {
		return tc.incrementerConsigne(stub, args)
	} else if function == "listerConsigne" {
		return tc.listerConsigne(stub, args)
	} else if function == "getLastKey" {
		return tc.getLastKey(stub, args)
	} else if function == "delete" {
		return tc.delete(stub, args)
	} else if function == "test" {
		return tc.test(stub)
	}
	return shim.Error("Invalid Trappiste Contract function name.")
}

/*******************************************************
	SAVE STRUCT
********************************************************/
func (tc *TrappisteContract) incrementerStock(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	id := args[0]
	nom := args[1]
	stock, err := strconv.Atoi(args[2])
	if err != nil {
		return shim.Error("err 3")
	}
	codeBarre, err := strconv.Atoi(args[3])
	if err != nil {
		return shim.Error("err 4")
	}
	consigne, err := strconv.ParseFloat(args[4], 32)
	if err != nil {
		return shim.Error("err 5")
	}
	prix, err := strconv.ParseFloat(args[5], 32)
	if err != nil {
		return shim.Error("err 6")
	}

	biereStruct := Biere{id, nom, stock, codeBarre, float32(consigne), float32(prix)} // hydate struct avec args

	biereAsBytes, err := json.Marshal(biereStruct) //encode
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(id, biereAsBytes) //write in ledger (key, value) aka (id, structData)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

func (tc *TrappisteContract) incrementerVente(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	var vente Vente
	var biereVendu map[string]int
	date, _ := strconv.Atoi(args[2])
	prixTotal, _ := strconv.ParseFloat(args[4], 32)

	err := json.Unmarshal([]byte(args[3]), &biereVendu) //"{\"biere1\" : \"6\", \"biere2\" : \"12\"}"
	if err != nil {
		return shim.Error(err.Error())
	}
	vente = Vente{Id: args[0], IdReduction: args[1], Date: date, BiereVendu: biereVendu, PrixTotal: float32(prixTotal)}
	venteAsBytes, err := json.Marshal(vente)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = stub.PutState(args[0], venteAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(nil)
}

func (tc *TrappisteContract) incrementerConsigne(stub shim.ChaincodeStubInterface, args []string) peer.Response {
	id := args[0]
	idBiere := args[1]
	count, err := strconv.Atoi(args[2])
	if err != nil {
		return shim.Error("err2")
	}

	consigne := Consigne{id, idBiere, count}       // hydate struct avec args
	consigneAsBytes, err := json.Marshal(consigne) //encode
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(id, consigneAsBytes) //write in ledger (key, value) aka (id, structData)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

func (tc *TrappisteContract) incrementerTicketDeReduction(stub shim.ChaincodeStubInterface, args []string) peer.Response {
	id := args[0]
	reductionPrix, err := strconv.ParseFloat(args[1], 32)
	if err != nil {
		return shim.Error("err 1")
	}
	codeBarre, err := strconv.Atoi(args[2])
	if err != nil {
		return shim.Error("err2")
	}
	isEnabled, err := strconv.ParseBool(args[3])
	if err != nil {
		return shim.Error("err 3")
	}

	ticketReduction := TicketReduction{id, float32(reductionPrix), codeBarre, isEnabled} // hydate struct avec args

	ticketReductionAsBytes, err := json.Marshal(ticketReduction) //encode
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(id, ticketReductionAsBytes) //write in ledger (key, value) aka (id, structData)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

/********************************************************
	LISTER STRUCT
*********************************************************/
func (tc *TrappisteContract) listerConsigne(stub shim.ChaincodeStubInterface, args []string) peer.Response {
	var startRange, endRange string = "Consigne", "Consigne~" // affiche toute les ventes si aucun param de range n'est donné
	if len(args[0]) >= 1 && len(args[1]) >= 1 {               //use user's params range
		startRange = args[0]
		endRange = args[1]
	}
	buffer, err := tc.lister(stub, startRange, endRange)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(buffer.Bytes())
}

func (tc *TrappisteContract) listerVente(stub shim.ChaincodeStubInterface, args []string) peer.Response {
	var startRange, endRange string = "Vente", "Vente~" // affiche toute les ventes si aucun param de range n'est donné
	if len(args[0]) >= 1 && len(args[1]) >= 1 {         //use user's params range
		startRange = args[0]
		endRange = args[1]
	}
	buffer, err := tc.lister(stub, startRange, endRange)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(buffer.Bytes())
}

func (tc *TrappisteContract) listerBieres(stub shim.ChaincodeStubInterface, args []string) peer.Response {
	var startRange, endRange string = "Biere", "Biere~" // affiche toute les ventes si aucun param de range n'est donné

	if len(args[0]) >= 1 && len(args[1]) >= 1 { //use user's params range
		startRange = args[0]
		endRange = args[1]
	}

	buffer, err := tc.lister(stub, startRange, endRange)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(buffer.Bytes())
}

func (tc *TrappisteContract) listerTicketReduction(stub shim.ChaincodeStubInterface, args []string) peer.Response {
	var startRange, endRange string = "TicketReduction", "TicketReduction~" // affiche toute les ventes si aucun param de range n'est donné
	if len(args[0]) >= 1 && len(args[1]) >= 1 {                             //use user's params range
		startRange = args[0]
		endRange = args[1]
	}
	buffer, err := tc.lister(stub, startRange, endRange)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(buffer.Bytes())
}

/********************************************************
	OTHER
*********************************************************/
func (tc *TrappisteContract) delete(stub shim.ChaincodeStubInterface, args []string) peer.Response {
	biereKey := args[0]
	err := stub.DelState(biereKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(nil)
}

func (tc *TrappisteContract) decrementerStock(stub shim.ChaincodeStubInterface, args []string) peer.Response {
	var err error
	var biereAsBytes []byte
	var biereKey string
	var biere Biere
	var decrementNumber int

	biereKey = args[0]
	decrementNumber, err = strconv.Atoi(args[1])
	if err != nil {
		return shim.Error(err.Error())
	}

	biereAsBytes, err = stub.GetState(biereKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = json.Unmarshal(biereAsBytes, &biere)
	if err != nil {
		return shim.Error(err.Error())
	}

	biere.Stock = biere.Stock - decrementNumber
	biereAsBytes, err = json.Marshal(biere)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = stub.PutState(biereKey, biereAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(nil)
}

func (tc *TrappisteContract) afficherBiereUnique(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	biereAsBytes, err := stub.GetState(args[0])
	if err != nil {
		return shim.Error(err.Error())
	} else if biereAsBytes == nil {
		return shim.Error("L'id biere n'existe pas")
	}

	return shim.Success(biereAsBytes)
}

func (tc *TrappisteContract) desactiverTicketDeReduction(stub shim.ChaincodeStubInterface, args []string) peer.Response {
	id := args[0] // Id Ticket reduction
	ticketReducAsBytes, err := stub.GetState(id)
	if err != nil {
		return shim.Error(err.Error())
	} else if ticketReducAsBytes == nil {
		return shim.Error("L'id TicketReduc n'existe pas")
	}
	ticketReduc := TicketReduction{}

	err = json.Unmarshal(ticketReducAsBytes, &ticketReduc)
	if err != nil {
		return shim.Error(err.Error())
	}
	ticketReduc.IsEnabled = false                       // ICI ON désactive
	ticketReducAsBytes, err = json.Marshal(ticketReduc) //encode
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(id, ticketReducAsBytes) //write in ledger (key, value) aka (id, structData)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

func (tc *TrappisteContract) getLastKey(stub shim.ChaincodeStubInterface, args []string) peer.Response {
	//args[0] doit etre du type Biere/Vente/Etc..
	i := 0
	iter, err := stub.GetStateByRange(args[0], "")
	if err != nil {
		return shim.Error(err.Error())
	}
	for iter.HasNext() {
		i++
		iter.Next()
	}
	if i > 0 {
		i--
	}
	return shim.Success([]byte(strconv.Itoa(i)))
}

/********************************************************
	PRIVATE
*********************************************************/
func (tc *TrappisteContract) lister(stub shim.ChaincodeStubInterface, startRange string, endRange string) (bytes.Buffer, error) {
	var buffer bytes.Buffer
	resultsIterator, err := stub.GetStateByRange(startRange, endRange)
	if err != nil {
		return buffer, err
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryResults

	buffer.WriteString("[")

	firstTimeInLoop := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return buffer, err
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
	return buffer, nil
}

func (tc *TrappisteContract) test(stub shim.ChaincodeStubInterface) peer.Response {
	// Get the client ID object
	idClient, err := cid.New(stub)
	if err != nil {
		return shim.Error("err une")
	}
	// mspid, err := idClient.GetMSPID()
	// if err != nil {
	// 	return shim.Error("err deux")
	// }
	cert, _ := idClient.GetX509Certificate()

	val := tc.isAdmin(cert)
	if val {
		return shim.Success([]byte("true"))
	}

	return shim.Success([]byte("false"))
	// switch mspid {
	// 	case "org1MSP":
	// 		err = id.AssertAttributeValue("attr1", "true")
	// 	case "org2MSP":
	// 		err = id.AssertAttributeValue("attr2", "true")
	// 	default:
	// 		err = errors.New("Wrong MSP")
	// }
	//return shim.Success([]byte(id))
}

func (tc *TrappisteContract) isAdmin(cert *x509.Certificate) bool {
	x := cert.Subject.ToRDNSequence().String()
	startIdx := strings.Index(x, "OU=") + 3

	if startIdx > -1 {
		endIdx := strings.Index(x[startIdx+1:], ",") + 1
		if endIdx > -1 {
			ouRole := x[startIdx : startIdx+endIdx]
			if ouRole == "admin" {
				return true
			}
		}
	}
	return false
}

/********************************************************
	INIT WITH MAIN()
*********************************************************/
func main() {
	//initialisation
	err := shim.Start(new(TrappisteContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
