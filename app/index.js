const express = require("express");
const mongoose = require("mongoose");
// const jwt = require('jsonwebtoken');

const bodyParser = require("body-parser");
const morgan = require("morgan"); //gives log
const Blockchain = require("../Blockchain");
const P2PServer = require("./P2Pserver");
const Wallet = require("../Wallet/index");
// const checkAuth = require("./middleware/check-auth");
const Miner = require("./miner");
const TransactionPool = require("../Wallet/transaction-pool");
const HTTP_PORT = process.env.PORT || 3000;
const app = express();
const bc = new Blockchain();
const wallet = new Wallet();
const tp = new TransactionPool();
const p2pServer = new P2PServer(bc, tp);
const miner = new Miner(bc, tp, wallet, p2pServer);
//database connection

mongoose.connect(
  `mongodb://user1:Aadish7024@ds233278.mlab.com:33278/blockchain`,
  { useNewUrlParser: true, useFindAndModify: false },
  function(err) {
    if (err) {
      console.error.bind(console, "connection error: ");
    } else {
      console.log("Connected to Data-Base");
    }
  }
);

mongoose.Promise = global.Promise;
app.use(morgan("dev"));

app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
// app.use("/users", userRoutes);
// req other than above rotes should get error
// app.use((req, res, next) => {
//   const error = new Error("Not found");
//   error.status = 404;
//   next(error);
// });

//allowing CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, PATCH, DELETE, POST,GET");
    return res.status(200).json({});
  }
  next();
});

app.get("/", function(req, res) {
  
  res.render("../views/index", { blocks: bc.chain });
});
app.get("/blocks", (req, res) => {
  res.json(bc.chain);
});
app.post("/mine", (req, res) => {
  const block = bc.addblock(req.body.data);
  console.log(`New block was added :${block.toString()}`);
  p2pServer.syncChains();
  res.redirect("/blocks");
});
app.get("/transactions", (req, res) => {
  // console.log(tp.transactions);
  // console.log(tp.transactions);
  // res.json(tp.transactions);
  res.render("../views/unmined", { transactions: tp.transactions });
});
app.get("/new-transact", (req, res) => {
  res.render("../views/new-transact");
});
app.post("/transact", (req, res, next) => {
  const { recipient, amount } = req.body;
  const transaction = wallet.createTransaction(recipient, amount, bc, tp);
  p2pServer.broadcastTransaction(transaction);
  console.log(transaction);
  res.redirect("/transactions");
});
app.get("/public_key", (req, res) => {
  res.json({ publicKey: wallet.publicKey });
});
app.get("/mine-transaction", (req, res, next) => {
  const block = miner.mine();
  console.log(`New BLock added: ${block.toString()}`);
  // res.redirect("/new-block");
  res.render("mine", { block: block });
});
app.get("/new-block", (req, res, next) => {
  res.render("mine", { block: block });
});
app.get("/difficulty", (req, res, next) => {
  res.render("difficulty");
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(500).send("Something happening wrong");
});

app.listen(HTTP_PORT, () => {
  console.log(`Port is listening on ${HTTP_PORT}`);
});
p2pServer.listen();
