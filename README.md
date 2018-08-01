# Blockchain Data

Blockchain has the potential to change the way that the world approaches data. Develop Blockchain skills by understanding the data model behind Blockchain by developing your own simplified private blockchain.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Configuring your project

- Use NPM to initialize your project and create package.json to store project dependencies.
```
npm init
```
- Install crypto-js and level from package.json 
```
npm install
```

## Testing

To test code:
0：Remove ./chaindata folder so that the block chain can be built from scratch(data persistent is support, while expect test result had been defined with empty folder)
1: Open a command prompt or shell terminal after install node.js.
2: Enter a node session, also known as REPL (Read-Evaluate-Print-Loop).
```
node
```
3: load simpleChain.js into session
```
.load simpleChain.js
```
4: Instantiate blockchain with blockchain variable
```
let blockchain = new Blockchain();
```
5: Generate 10 blocks using a for loop(addBlock is async function, so have to wrapped by async)
```
(async function(){
	for (var i=0; i<=10; i++){
		await blockchain.addBlock(new DomainObjects.Block('test data'+i))
	}
}())

```
6: Validate blockchain
```
blockchain.validateChain();
```
7: Induce errors by changing block data
```
let inducedErrorBlocks = [2,4,7];
for (var i = 0; i < inducedErrorBlocks.length; i++) {
  blockchain.getBlock(inducedErrorBlocks[i]).then(function(block){
	block.body = 'induced chain error'
	return db.put(block.height, JSON.stringify(block))
  })
}
```
8: Validate blockchain. The chain should now fail with blocks 2,4, and 7.
```
blockchain.validateChain();
```
