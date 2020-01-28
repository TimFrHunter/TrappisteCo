package main

import (
	"fmt"
	"testing"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

/*
* TestInvokeInitVehiclePart simulates an initVehiclePart transaction on the CarDemo cahincode
 */
func TestInvokeInitVehiclePart(t *testing.T) {
	fmt.Println("Entering TestInvokeInitVehiclePart")

	// Instantiate mockStub using CarDemo as the target chaincode to unit test
	stub := shim.NewMockStub("mockStub", new(TrappisteContract))
	if stub == nil {
		t.Fatalf("MockStub creation failed")
	}

	// var serialNumber = "ser1234"

	// // Here we perform a "mock invoke" to invoke the function "initVehiclePart" method with associated parameters
	// // The first parameter is the function we are invoking
	// result := stub.MockInvoke("updateBiere",
	// 	[][]byte{[]byte("initVehiclePart"),
	// 		[]byte(serialNumber),
	// 		[]byte("tata"),
	// 		[]byte("1502688979"),
	// 		[]byte("airbag 2020"),
	// 		[]byte("aaimler ag / mercedes")})

	// // We expect a shim.ok if all goes well
	// if result.Status != shim.OK {
	// 	t.Fatalf("Expected unauthorized user error to be returned")
	// }

	// // here we validate we can retrieve the vehiclePart object we just committed by serianNumber
	// valAsbytes, err := stub.GetState(serialNumber)
	// if err != nil {
	// 	t.Errorf("Failed to get state for " + serialNumber)
	// } else if valAsbytes == nil {
	// 	t.Errorf("Vehicle part does not exist: " + serialNumber)
	// }
}
