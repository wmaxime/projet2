const Voting = artifacts.require("Voting");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('Voting', accounts => {
    const owner = accounts[0];
    const voter1 = accounts[1];
    const voter2 = accounts[2];
    const voter3 = accounts[3];
    //console.log("Address voter 3 : " + voter3)

    let VotingInstance

    // Check deployed contract address, check first workflow status is RegisteringVoters
    describe("Check des GETTERS", function () {

        beforeEach(async function () {
            VotingInstance = await Voting.new({from:owner});
            //await VotingInstance.addVoter(voter1, {from: owner});
            //await VotingInstance.getVoter(voter1, {from: voter1});
        });

        it("Only voter can get voter status", async () => {
            await VotingInstance.addVoter(voter1, {from: owner});
            let getVoter = await VotingInstance.getVoter(voter1, {from: voter1});
            //console.log("GET INSTANCE RESULT = " + getVoter.isRegistered);
            expect(getVoter.isRegistered).to.be.true;
            //expectRevert(getVoter, "You're not a voter");
        });

        it("Only voter can get proposal", async () => {
            let description = "Poposal one"
            await VotingInstance.addVoter(voter1, {from: owner});
            await VotingInstance.startProposalsRegistering({from: owner});
            await VotingInstance.addProposal(description, {from: voter1});
            let getProposal = await VotingInstance.getOneProposal(1, {from: voter1});
            //console.log("GET INSTANCE RESULT = " + getProposal.description);
            expect(getProposal.description).to.be.equal(description);
        });    

     }); 

     // Check REGISTRATION
     describe("Check REGISTRATION", function () {

        beforeEach(async function () {
            VotingInstance = await Voting.new({from:owner});
        });

        it("Only Owner can add voter", async () => {
            await expectRevert(VotingInstance.addVoter(voter1, {from: voter2}), "Ownable: caller is not the owner"); 
            // expectRevert => Le message d'erreur doit etre identique sinon le message de retour d'erreur n'est pas identique et le test ne passe pas
            // l'écriture de la condition ne doit pas passer pour que le test résussisse
        });

        it("Require : WorkflowStatus not good to add voter", async () => {
            await VotingInstance.startProposalsRegistering(); // Changement du status
            await expectRevert(VotingInstance.addVoter(voter1, {from: owner}), "Voters registration is not open yet");
        });

        it("Require : Voter is not already registred", async () => {
            await VotingInstance.addVoter(voter1, {from: owner}) // Add first the voter, so he is already registred
            await expectRevert(VotingInstance.addVoter(voter1, {from: owner}), "Already registered");
        });

     });

    // Check PROPOSAL
    describe("Check PROPOSAL", function () {

        beforeEach(async function () {
            VotingInstance = await Voting.new({from:owner});
        });

        it("Only voters can vote", async () => {
            let description = "Poposal one"
            await VotingInstance.addVoter(voter1, {from: owner});
            await VotingInstance.startProposalsRegistering({from: owner});
            await expectRevert(VotingInstance.addProposal(description, {from: voter2}), "You're not a voter");
        });

        it("Require : Workflow not good to add proposal", async () => {
            let description = "Poposal one"
            await VotingInstance.addVoter(voter1, {from: owner});
            //await VotingInstance.startProposalsRegistering({from: owner});
            await expectRevert(VotingInstance.addProposal(description, {from: voter1}), "Proposals are not allowed yet");
        });

        it("Require : Empty proposal not authorize", async () => {
            let description = ""
            await VotingInstance.addVoter(voter1, {from: owner});
            await VotingInstance.startProposalsRegistering({from: owner});
            await expectRevert(VotingInstance.addProposal(description, {from: voter1}), "Vous ne pouvez pas ne rien proposer");
        });

     });


});