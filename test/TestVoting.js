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
 /*    describe("Check Registration", function () {

        beforeEach(async function () {
            VotingInstance = await Voting.new({from:owner});
            await VotingInstance.addVoter(voter1, {from: owner});
        });

        it("Only Owner can add voter", async () => {
            //await VotingInstance.addVoter(voter1, {from: voter2});
            await expectRevert(VotingInstance.addVoter(voter2, {from: owner}), "You're not allowed to add voter");
        });

     });
*/

});