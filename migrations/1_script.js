const Voting = artifacts.require("Voting");	// Nom du contract à deployer

module.exports=(deployer) => {			// deployer = nom au choix
    deployer.deploy(Voting);		// Voting => nom du contract à deployer
}