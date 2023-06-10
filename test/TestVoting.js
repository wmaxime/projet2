const Voting = artifacts.require("Voting");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('Voting', accounts => {
    const owner = accounts[0];
    const voter1 = accounts[1];
    const voter2 = accounts[2];
    const voter3 = accounts[3];

    let VotingInstance

    // Check deployed contract address, check first workflow status is RegisteringVoters
    describe("Check des GETTERS", function () {

        beforeEach(async function () {
            VotingInstance = await Voting.new({from:owner});
            await VotingInstance.addVoter(voter1);
        });

        it("should revert if not voter", function () {
            expectRevert(VotingInstance.getVoter(voter1), "You're not a voter");
        });

     }); 

    /*
    let StorageInstance;

    describe("test require and event", function () {
        
        context("test sur telle fonction", function () {

            beforeEach(async function () {
                StorageInstance = await SimpleStorage.new({from:owner});
            });

            it("should verify require pass", async () => {
                await StorageInstance.set(8, { from: owner });
                const storedData = await StorageInstance.get();
                expect(storedData).to.be.bignumber.equal(BN(8));
            });

            it("should verify require not passing", async () => {
                await expectRevert(StorageInstance.set(42, { from: owner }), 'pas bon'); 
            });

            it("should verify event", async () => {
                const findEvent = await StorageInstance.set(8, { from: owner });
                expectEvent(findEvent,"Setted" ,{_value: BN(8)});
            });

        });
    });
*/

});