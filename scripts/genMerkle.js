const MerkleTreeSolidity = require("merkle-tree-solidity");
const MerkleTree = MerkleTreeSolidity.default;
const checkProof = MerkleTreeSolidity.checkProof;
const merkleRoot = MerkleTreeSolidity.merkleRoot;
const checkProofSolidityFactory = MerkleTreeSolidity.checkProofSolidityFactory;
const utils = require("ethereumjs-util");
const keccak256 = utils.sha3;
const calcEndowment = require('./calcEndowment');
// const keccak256 = require('js-sha3').keccak256;
// const sha3 = require("solidity-sha3").default;
const toBuffer = utils.toBuffer;
const bufferToHex = utils.bufferToHex;
const setLengthLeft = utils.setLengthLeft;
const setLengthRight = utils.setLengthRight;
const users = require("../out/users.json");
const config = require("../data/config.json");
const rootIdx = config.RECDAO.rootIdx;
const fs = require("fs");

const userArrays = users.map(u=>[u.address, u.username, calcEndowment(u), u.firstContent]);
console.log(userArrays[0])

const userHashBuffers = userArrays.map(u=>{
  let userBuffer = Buffer.concat([
    toBuffer(u[0]),
    setLengthRight(toBuffer(u[1]), 20),
    setLengthLeft(toBuffer(u[2]), 4),
    setLengthLeft(toBuffer(u[3]), 4)
  ])
  return keccak256(userBuffer)
})
// const userHashesHex = userHashBuffers.map(b=>bufferToHex(b))

const merkleTree = new MerkleTree(userHashBuffers)

const userRegInputs = userArrays.map((ua,idx)=>{
  let address = ua.shift();
  ua.push(merkleTree.getProof(userHashBuffers[idx]).map(p=>bufferToHex(p)))
  ua.push(rootIdx)
  ua.push(address);
  return ua
})

const root = bufferToHex(merkleTree.getRoot())

fs.writeFileSync(`${__dirname}/../data/userRegInputs.json`, JSON.stringify(userRegInputs))
fs.writeFileSync(`${__dirname}/../data/merkleRoot.json`, JSON.stringify(root))
// TODO properly calculate modDayRate
// fs.writeFileSync(`${__dirname}/../out/modDayRate.json`, JSON.stringify(24))

// const username = "MrKup";
// const username = "doppio";
var username = "TEST_USER";
var userIdx = users.findIndex(u=>u.username===username)
console.log(`${username} hash: ${bufferToHex(userHashBuffers[userIdx])}`)

var username = "carlslarson";
var userIdx = users.findIndex(u=>u.username===username)
console.log(`${username} hash: ${bufferToHex(userHashBuffers[userIdx])}`)

var username = "heliumcraft";
var userIdx = users.findIndex(u=>u.username===username)
console.log(`${username} hash: ${bufferToHex(userHashBuffers[userIdx])}`)

console.log(`root: ${root}`)
