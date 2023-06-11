# Projet2

Vous repartirez du smart contract proposé en correction 

Depuis la dernière version, vous avez vu la partie CI/CD avec les tests et le déploiement. 

Vous devez alors fournir les tests unitaires de votre smart contract Nous n’attendons pas une couverture à 100% du smart contract mais veillez à bien tester les différentes possibilités de retours (event, revert).

**********************************************************************************

# ORDRE DES TESTS

Le fichier de test est ordonné pour suivre le déroulement du contrat Voting.sol en respectant la vérification des droits, des requires, des events :

1- Test des GETTERS
2- Test de l'étape REGISTRATION : fonction addVoter(address)
3- Test de l'étape PROPOSAL : fonction addProposal(description)
4- Test de l'étape VOTE : fonction setVote(id_de_la_propal)
5- Test des WORKFLOWSTATUS : startProposalsRegistering(), endProposalsRegistering(), startVotingSession(), endVotingSession()
6- Test du dépouillage des votes : fonction tallyVotes()


