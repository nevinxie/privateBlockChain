/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/
const SHA256 = require('crypto-js/sha256')
const level = require('level')

const chainDB = './chaindata'
const db = level(chainDB)

const DomainObjects = require('./DomainObjects.js')

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{
  constructor(){
	var self = this  
	db.get('current_block_height')
	.then(function(value){console.log('current height is ' + value)})
	.catch(function(err){
		if(err.notFound){
          self.addBlock(new DomainObjects.Block("First block in the chain - Genesis block"));
        }	
	})
  }
  
  // Add new {block}
  async addBlock(newBlock){
	try{
		newBlock.height = parseInt(await db.get('current_block_height'))+1
		console.log('new block height:'+newBlock.height)
	}catch(error){
		newBlock.height=0
		console.log('starting genesis block')
	}
	// UTC timestamp
	newBlock.time = new Date().getTime().toString().slice(0,-3);
	if (newBlock.height>0){
		newBlock.previousBlockHash = JSON.parse(await db.get(newBlock.height-1)).hash
		console.log('prevBlockHash:'+newBlock.previousBlockHash)
	}
	newBlock.hash = SHA256(JSON.stringify(newBlock)).toString()
	console.log('save block:'+JSON.stringify(newBlock))
	await db.put(newBlock.height, JSON.stringify(newBlock))
	console.log('save current height:'+ newBlock.height)
	await db.put('current_block_height', newBlock.height)
  }

  // Get block height
  async getBlockHeight(){
    return await db.get('current_block_height');
  }

  // get block
  async getBlock(blockHeight){
    return JSON.parse(await db.get(blockHeight));
  }

    // validate block
  async validateBlock(blockHeight){
    // get block object
    let block = await this.getBlock(blockHeight);
    // get block hash
    let blockHash = block.hash;
    // remove block hash to test block integrity
    block.hash = '';
    // generate block hash
    let validBlockHash = SHA256(JSON.stringify(block)).toString();
    // Compare
    if (blockHash===validBlockHash) {
       return true;
    } else {
       console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
       return false;
    }
  }

  // Validate blockchain
  async validateChain(){
    let errorLog = [];
	let currentBlockHeight = parseInt(await db.get('current_block_height'))
    for (var i = 0; i < currentBlockHeight; i++) {
      // validate block
	  let valid = await this.validateBlock(i)
      if (!valid)errorLog.push(i);
      // compare blocks hash link
	  if (i !== currentBlockHeight){
		let blockHash = await this.getBlock(i).hash;
		let previousHash = await this.getBlock(i+1).previousBlockHash;
		if (blockHash!==previousHash) {
			errorLog.push(i);
		}    
	  }
    }
	//validate the current block height
	let blockCount = await this.getBlockCountFromDB()
	if(currentBlockHeight!=blockCount-1){
		errorLog.push('invalid current block height, height:'+currentBlockHeight+', block count:'+blockCount)
	}
    if (errorLog.length>0) {
      console.log('Block errors = ' + errorLog.length);
      console.log('Blocks: '+errorLog);
    } else {
      console.log('No errors detected');
    }
  }
  
  getBlockCountFromDB(){
	  return new Promise((resolve,reject)=>{
			let i = 0;
			db.createReadStream().on('data', function (data) {
				if(data.key!=='current_block_height'){
					//do not count item- 'current_block_height' as a block
					i++;
				}
			})
			.on('error', function (err) {
				console.log('Error found: ', err);
				reject(err)
			})
			.on('close', function () {
				console.log('block count:'+i)
				resolve(i);
			}); 
		});
  }
  
}
