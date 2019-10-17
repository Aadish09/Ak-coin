const Block = require("./block.js");
const fs = require("fs");

// Write data in 'Output.txt' .

class BlockChain {
  constructor() {
    //initialize chain with genesis
    this.chain = [Block.genesis()];
    fs.writeFile("data.txt", Block.genesis(), err => {
      // In case of a error throw err.
      if (err) throw err;
    });
  }
  //adding new block

  addblock(data) {
    const block = Block.mine(this.chain[this.chain.length - 1], data);
    this.chain.push(block);
    fs.appendFile("data.txt", "\n" + block, err => {
      // In case of a error throw err.
      if (err) throw err;
      console.log("The file was saved!");
    });
    return block;
  }
  isValidChain(chain) {
    // console.log(JSON.stringify(chain[0]));
    // console.log("--------------------");
    // console.log(JSON.stringify(Block.genesis()));
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
      return false;
    }
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const lastBlock = chain[i - 1];
      //   console.log(chain[0] + "dnnnnf" + chain[1]);
      //   console.log(Block.blockHash(block).toString());

      if (
        lastBlock.hash !== block.prevHash ||
        block.hash !== Block.blockHash(block)
      ) {
        return false;
      }
    }
    return true;
  }
  replaceChain(newChain) {
    if (newChain.length <= this.chain.length) {
      console.log("new chain is shorter in length");
      return;
    } else if (!this.isValidChain(newChain)) {
      console.log("not a valid chain");
      return;
    } else {
      console.log("Replacing with new chain");
      this.chain = newChain;
    }
  }
}
module.exports = BlockChain;
