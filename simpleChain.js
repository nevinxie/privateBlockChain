/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/
const SHA256 = require('crypto-js/sha256')
const level = require('level')

const chainDB = './chaindata'
const db = level(chainDB)


function addLevelDBData(key,value){
  db.put(key, value, function(err) {
    if (err) return console.log('Block ' + key + ' submission failed', err);
  })
}


/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/


class Block{
	constructor(data){
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
    }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{
  constructor(){
    var self = this;
    db.get('current_block_height', function(err, value){
      if (err){
        if(err.notFound){
          self.currentBlockHeight = -1;
          self.addBlock(new Block("First block in the chain - Genesis block"));
        }
        return callback(err)
      }
      self.currentBlockHeight = parseInt(value);
    }) 
  }

  // Add new {block}
  addBlock(newBlock){
    var self = this;
    // Block height
    newBlock.height = this.getBlockHeight()+1;
    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0,-3);
    // previous block hash
    if(newBlock.height>0){
      newBlock.previousBlockHash = this.previousHash;
    }
    // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
    this.previousHash = newBlock.hash;
    // Adding block object to chain
    addLevelDBData(newBlock.height, JSON.stringify(newBlock));

    db.put('current_block_height',newBlock.height)
    .then(function(){return db.get('current_block_height')})
    .then(function(value){self.currentBlockHeight = parseInt(value)})
    .catch(function (err) { console.error(err) });
  }

  // Get block height
  getBlockHeight(){
    return this.currentBlockHeight;
  }

    // get block
  async getBlock(blockHeight){
    return JSON.parse(await db.get(blockHeight));
  }

    // validate block
    validateBlock(blockHeight){
      // get block object
      let block = this.getBlock(blockHeight);
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
    validateChain(){
      let errorLog = [];
      for (var i = 0; i < this.chain.length-1; i++) {
        // validate block
        if (!this.validateBlock(i))errorLog.push(i);
        // compare blocks hash link
        let blockHash = this.getBlock(i).hash;
        let previousHash = this.getBlock(i+1).previousBlockHash;
        if (blockHash!==previousHash) {
          errorLog.push(i);
        }
      }
      if (errorLog.length>0) {
        console.log('Block errors = ' + errorLog.length);
        console.log('Blocks: '+errorLog);
      } else {
        console.log('No errors detected');
      }
    }
}
