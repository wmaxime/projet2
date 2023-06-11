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

        it("Only Voter can get other Voter status ", async () => {
            await VotingInstance.addVoter(voter1, {from: owner});
            await expectRevert(VotingInstance.getVoter(voter1, {from: voter2}), "You're not a voter");
        });

        it("Check Voter is registred", async () => {
            await VotingInstance.addVoter(voter1, {from: owner});
            let getVoter = await VotingInstance.getVoter(voter1, {from: voter1});
            //console.log("GET INSTANCE RESULT = " + getVoter.isRegistered);
            expect(getVoter.isRegistered).to.be.true;
        });

        it("Only Voter can get proposal ", async () => {
            let description = "Poposal one"
            await VotingInstance.addVoter(voter1, {from: owner});
            await VotingInstance.startProposalsRegistering({from: owner});
            await VotingInstance.addProposal(description, {from: voter1});
            await expectRevert(VotingInstance.getOneProposal(1, {from: voter2}), "You're not a voter");
        });

        it("Check proposal is registred", async () => {
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

        // Ajouter les EMIT ou check des EVENT
        it("Check Emit : VoterRegistered", async () => {
            const findEvent = await VotingInstance.addVoter(voter1, {from: owner});
            expectEvent(findEvent,"VoterRegistered" ,{voterAddress: voter1}); // L'ecriture de la condition doit passer pour valider le test
        });

        it("should add a voter", async () => {
            await VotingInstance.addVoter(voter1, {from: owner});
            const storedData = await VotingInstance.getVoter(voter1, {from: voter1});
            expect(storedData.isRegistered).to.be.true;
        });

     });

    // Check PROPOSAL
    describe("Check PROPOSAL", function () {

        beforeEach(async function () {
            VotingInstance = await Voting.new({from:owner});
        });

        it("Only voters can add proposal", async () => {
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

         // Ajouter les EMIT
         it("Check Emit : ProposalRegistered", async () => {
            let description = "Poposal one"
            await VotingInstance.addVoter(voter1, {from: owner});
            await VotingInstance.startProposalsRegistering({from: owner});
            const findEvent = await VotingInstance.addProposal(description, {from: voter1});
            expectEvent(findEvent,"ProposalRegistered" ,{proposalId: BN(1)});
        });

        it("should add a proposal", async () => {
            let description = "Poposal one"
            await VotingInstance.addVoter(voter1, {from: owner});
            await VotingInstance.startProposalsRegistering({from: owner});
            await VotingInstance.addProposal(description, {from: voter1});
            const storedData = await VotingInstance.getOneProposal(1, {from: voter1});
            expect(storedData.description).to.equal(description);
        });

     });

   // Check VOTE
   describe("Check VOTE", function () {

        beforeEach(async function () {
            VotingInstance = await Voting.new({from:owner});
        });

        it("Only voters can vote", async () => {
            let description1 = "Poposal one"
            await VotingInstance.addVoter(voter1, {from: owner});
            await VotingInstance.startProposalsRegistering({from: owner});
            await VotingInstance.addProposal(description1, {from: voter1});
            await VotingInstance.endProposalsRegistering({from: owner});
            await VotingInstance.startVotingSession({from: owner});
            await expectRevert(VotingInstance.setVote(1, {from: voter2}), "You're not a voter");
        });

        it("Require : WorkflowStatus not good to vote", async () => {
            let description1 = "Poposal one"
            await VotingInstance.addVoter(voter1, {from: owner});
            await VotingInstance.startProposalsRegistering({from: owner});
            await VotingInstance.addProposal(description1, {from: voter1});
            await VotingInstance.endProposalsRegistering({from: owner});
            //await VotingInstance.startVotingSession({from: owner});
            await expectRevert(VotingInstance.setVote(1, {from: voter1}), "Voting session havent started yet");
        });

        it("Require : Voter has already voted", async () => {
            let description1 = "Poposal one"
            await VotingInstance.addVoter(voter1, {from: owner});
            await VotingInstance.startProposalsRegistering({from: owner});
            await VotingInstance.addProposal(description1, {from: voter1});
            await VotingInstance.endProposalsRegistering({from: owner});
            await VotingInstance.startVotingSession({from: owner});
            await VotingInstance.setVote(1, {from: voter1});
            await expectRevert(VotingInstance.setVote(1, {from: voter1}), "You have already voted");
        });

        it("Require : Proposal must exist", async () => {
            let description1 = "Poposal one"
            await VotingInstance.addVoter(voter1, {from: owner});
            await VotingInstance.startProposalsRegistering({from: owner});
            await VotingInstance.addProposal(description1, {from: voter1});
            await VotingInstance.endProposalsRegistering({from: owner});
            await VotingInstance.startVotingSession({from: owner});
            await expectRevert(VotingInstance.setVote(999, {from: voter1}), "Proposal not found");
        });

        it("Vote count of proposal should increment", async () => {
            let description1 = "Poposal one"
            await VotingInstance.addVoter(voter1, {from: owner});
            await VotingInstance.addVoter(voter2, {from: owner});
            await VotingInstance.addVoter(voter3, {from: owner});
            await VotingInstance.startProposalsRegistering({from: owner});
            await VotingInstance.addProposal(description1, {from: voter1});
            await VotingInstance.endProposalsRegistering({from: owner});
            await VotingInstance.startVotingSession({from: owner});
            await VotingInstance.setVote(1, {from: voter1});
            await VotingInstance.setVote(1, {from: voter2});
            await VotingInstance.setVote(1, {from: voter3});
            const storedData = await VotingInstance.getOneProposal(1, {from: voter1});
            expect(storedData.voteCount).to.be.bignumber.equal(new BN(3));
        });

        // Ajouter les EMIT
         it("Check Emit : Voted", async () => {
            let description1 = "Poposal one"
            await VotingInstance.addVoter(voter1, {from: owner});
            await VotingInstance.startProposalsRegistering({from: owner});
            await VotingInstance.addProposal(description1, {from: voter1});
            await VotingInstance.endProposalsRegistering({from: owner});
            await VotingInstance.startVotingSession({from: owner});
            const findEvent = await VotingInstance.setVote(1, {from: voter1});
            expectEvent(findEvent,"Voted" ,{proposalId: BN(1)});
        });

        it("should be able to vote for a proposal", async () => {
            let description1 = "Poposal one"
            await VotingInstance.addVoter(voter1, {from: owner});
            await VotingInstance.startProposalsRegistering({from: owner});
            await VotingInstance.addProposal(description1, {from: voter1});
            await VotingInstance.endProposalsRegistering({from: owner});
            await VotingInstance.startVotingSession({from: owner});
            await VotingInstance.setVote(1, {from: voter1});
            const storedData = await VotingInstance.getOneProposal(1, {from: voter1});
            expect(storedData.voteCount).to.be.bignumber.equal(new BN(1));
        });

    });

   // Check STATE
   describe("Check STATE", function () {

    context("test fonction : startProposalsRegistering", function () {
        beforeEach(async function () {
            VotingInstance = await Voting.new({from:owner});
        });

        it("Only owner can change state : startProposalsRegistering", async () => {
            await expectRevert(VotingInstance.startProposalsRegistering({from: voter2}), "Ownable: caller is not the owner");
        });

        it("Require : precedent status should be RegisteringVoters (Index 0)", async () => {
            //let status = await VotingInstance.workflowStatus({from: owner});
            //console.log("STATUS VALUE = " + status)
            const storedData = await VotingInstance.workflowStatus({from: owner});
            expect(storedData).to.be.bignumber.equal(new BN(0));
        });

        it("Changing status to startProposalsRegistering should return status index 1", async () => {
            await VotingInstance.startProposalsRegistering({from: owner});
            const storedData = await VotingInstance.workflowStatus({from: owner});
            expect(storedData).to.be.bignumber.equal(new BN(1));
        });

        it("Function should return for proposal index 0 a description GENESIS", async () => {
            await VotingInstance.addVoter(voter1, {from: owner});
            await VotingInstance.startProposalsRegistering({from: owner});
            const storedData = await VotingInstance.getOneProposal(0, {from: voter1});
            expect(storedData.description).to.be.equal("GENESIS");
        });

        // Ajouter les EMIT
        it("Check Emit : WorkflowStatusChange", async () => {
            const findEvent = await VotingInstance.startProposalsRegistering({from: owner});
            expectEvent(findEvent,"WorkflowStatusChange" ,{previousStatus: new BN(0), newStatus: new BN(1)});
            //expectEvent(findEvent,"WorkflowStatusChange" ,{newStatus: BN(1)});
        });
    });

    context("test fonction : endProposalsRegistering", function () {
        beforeEach(async function () {
            VotingInstance = await Voting.new({from:owner});
        });

        it("Only owner can change state : endProposalsRegistering", async () => {
            await expectRevert(VotingInstance.endProposalsRegistering({from: voter1}), "Ownable: caller is not the owner");
        });

        it("Require : precedent status should be ProposalsRegistrationStarted (Index 1)", async () => {
            await VotingInstance.startProposalsRegistering({from: owner});
            const storedData = await VotingInstance.workflowStatus({from: owner});
            expect(storedData).to.be.bignumber.equal(new BN(1));
        });

        it("Changing status to endProposalsRegistering should return status index 2", async () => {
            await VotingInstance.startProposalsRegistering({from: owner});
            await VotingInstance.endProposalsRegistering({from: owner});
            const storedData = await VotingInstance.workflowStatus({from: owner});
            expect(storedData).to.be.bignumber.equal(new BN(2));
        });

        // Ajouter les EMIT
        it("Check Emit : WorkflowStatusChange", async () => {
            await VotingInstance.startProposalsRegistering({from: owner});
            const findEvent = await VotingInstance.endProposalsRegistering({from: owner});
            expectEvent(findEvent,"WorkflowStatusChange" ,{previousStatus: new BN(1), newStatus: new BN(2)});
        });
    });

    context("test fonction : startVotingSession", function () {
        beforeEach(async function () {
            VotingInstance = await Voting.new({from:owner});
        });

        it("Only owner can change state : startVotingSession", async () => {
            await expectRevert(VotingInstance.startVotingSession({from: voter1}), "Ownable: caller is not the owner");
        });

        it("Require : precedent status should be ProposalsRegistrationEnded (Index 2)", async () => {
            await VotingInstance.startProposalsRegistering({from: owner});
            await VotingInstance.endProposalsRegistering({from: owner});
            const storedData = await VotingInstance.workflowStatus({from: owner});
            expect(storedData).to.be.bignumber.equal(new BN(2));
        });

        it("Changing status to startVotingSession should return status index 3", async () => {
            await VotingInstance.startProposalsRegistering({from: owner});
            await VotingInstance.endProposalsRegistering({from: owner});
            await VotingInstance.startVotingSession({from: owner});
            const storedData = await VotingInstance.workflowStatus({from: owner});
            expect(storedData).to.be.bignumber.equal(new BN(3));
        });

        // Ajouter les EMIT
        it("Check Emit : WorkflowStatusChange", async () => {
            await VotingInstance.startProposalsRegistering({from: owner});
            await VotingInstance.endProposalsRegistering({from: owner});
            const findEvent = await VotingInstance.startVotingSession({from: owner});
            expectEvent(findEvent,"WorkflowStatusChange" ,{previousStatus: new BN(2), newStatus: new BN(3)});
        });
    });

    context("test fonction : endVotingSession", function () {
        beforeEach(async function () {
            VotingInstance = await Voting.new({from:owner});
        });

        it("Only owner can change state : endVotingSession", async () => {
            await expectRevert(VotingInstance.endVotingSession({from: voter1}), "Ownable: caller is not the owner");
        });

        it("Require : precedent status should be startVotingSession (Index 3)", async () => {
            await VotingInstance.startProposalsRegistering({from: owner});
            await VotingInstance.endProposalsRegistering({from: owner});
            await VotingInstance.startVotingSession({from: owner});
            const storedData = await VotingInstance.workflowStatus({from: owner});
            expect(storedData).to.be.bignumber.equal(new BN(3));
        });

        it("Changing status to endVotingSession should return status index 4", async () => {
            await VotingInstance.startProposalsRegistering({from: owner});
            await VotingInstance.endProposalsRegistering({from: owner});
            await VotingInstance.startVotingSession({from: owner});
            await VotingInstance.endVotingSession({from: owner});
            const storedData = await VotingInstance.workflowStatus({from: owner});
            expect(storedData).to.be.bignumber.equal(new BN(4));
        });

        // Ajouter les EMIT
        it("Check Emit : WorkflowStatusChange", async () => {
            await VotingInstance.startProposalsRegistering({from: owner});
            await VotingInstance.endProposalsRegistering({from: owner});
            await VotingInstance.startVotingSession({from: owner});
            const findEvent = await VotingInstance.endVotingSession({from: owner});
            expectEvent(findEvent,"WorkflowStatusChange" ,{previousStatus: new BN(3), newStatus: new BN(4)});
        });
    });

});

   // Check tallyVotes
   describe("Check TALLYVOTES", function () {

    context("test fonction : tallyVotes", function () {
        beforeEach(async function () {
            VotingInstance = await Voting.new({from:owner});
        });

        it("Only owner can tally votes", async () => {
            await expectRevert(VotingInstance.tallyVotes({from: voter2}), "Ownable: caller is not the owner");
        });

        it("Require : WorkflowStatus not good to tally votes", async () => {
            await VotingInstance.startProposalsRegistering({from: owner});
            await VotingInstance.endProposalsRegistering({from: owner});
            await VotingInstance.startVotingSession({from: owner});
            await expectRevert(VotingInstance.tallyVotes({from: owner}), "Current status is not voting session ended");
        });

        it("winningProposalId should be ZERO before anything", async () => {
            const winnerProposalId = await VotingInstance.winningProposalID.call();
            expect(winnerProposalId).to.be.bignumber.equal(new BN(0));
        });

        it("should be able to count votes and return winningProposalId", async () => {
            let description1 = "Poposal one"
            let description2 = "Poposal two"
            await VotingInstance.addVoter(voter1, {from: owner});
            await VotingInstance.addVoter(voter2, {from: owner});
            await VotingInstance.addVoter(voter3, {from: owner});
            await VotingInstance.startProposalsRegistering({from: owner});
            await VotingInstance.addProposal(description1, {from: voter1});
            await VotingInstance.addProposal(description2, {from: voter2});
            await VotingInstance.endProposalsRegistering({from: owner});
            await VotingInstance.startVotingSession({from: owner});
            await VotingInstance.setVote(1, {from: voter1});
            await VotingInstance.setVote(2, {from: voter2});
            await VotingInstance.setVote(2, {from: voter3});    // Proposal 2 is winner
            await VotingInstance.endVotingSession({from: owner});

            await VotingInstance.tallyVotes({from: owner});
            const winnerProposalId = await VotingInstance.winningProposalID.call();
            expect(winnerProposalId).to.be.bignumber.equal(new BN(2));  // should return proposal 2
        });

        it("Changing status to VotesTallied should return status index 5", async () => {
            await VotingInstance.startProposalsRegistering({from: owner});
            await VotingInstance.endProposalsRegistering({from: owner});
            await VotingInstance.startVotingSession({from: owner});
            await VotingInstance.endVotingSession({from: owner});
            await VotingInstance.tallyVotes({from: owner});
            const storedData = await VotingInstance.workflowStatus({from: owner});
            expect(storedData).to.be.bignumber.equal(new BN(5));
        });

        // Ajouter les EMIT
        it("Check Emit : WorkflowStatusChange", async () => {
            await VotingInstance.startProposalsRegistering({from: owner});
            await VotingInstance.endProposalsRegistering({from: owner});
            await VotingInstance.startVotingSession({from: owner});
            await VotingInstance.endVotingSession({from: owner});
            const findEvent = await VotingInstance.tallyVotes({from: owner});
            expectEvent(findEvent,"WorkflowStatusChange" ,{previousStatus: new BN(4), newStatus: new BN(5)});
        });

    });
});

});