const Voting = artifacts.require("Voting");	// Nom du cotract à deployer

module.exports=(deployer) => {			// deployer = nom au choix
    deployer.deploy(Voting);		// SimpleStorage => nom du contract à deployer
}