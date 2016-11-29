// {
//     "node": true,
//     "camelcase": true,
//     "indent": 4,
//     "undef": true,
//     "quotmark": "single",
//     "maxlen": 80,
//     "trailing": true,
//     "curly": true,
//     "eqeqeq": true,
//     "forin": true,
//     "immed": true,
//     "latedef": true,
//     "newcap": true,
//     "nonew": true,
//     "unused": true,
//     "strict": true
// }

 /*global require*/

 //server side javascript
 /*	CPSC 473 Project 1: Filmder (Should I watch this?)
	Submitted by- Team- Oscillatory Memorization
	Email- supra.chavan@gmail.com
 */

//Modules required to run the application
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

// variables for the app + socket.io
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
// var request = require('request');

mongoose.connect('mongodb://localhost/Project2');
mongoose.set('debug', true);


var userSchema = new mongoose.Schema({  
	userName: String,
	email: String,
	password: String
});

var itemSchema = new mongoose.Schema({
	itemName: String,
	itemPrice: Number,
	itemDescription: String,
	itemType: String,
	mUserId: [String]
});

var UserDb = mongoose.model('user', userSchema); 
var ItemDb = mongoose.model('item', itemSchema);


app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use("/", express.static("public"));

server.listen(port, function() {
  console.log('Server listening on port 3000.');  
});

io.on('connection', function(socket){
	console.log('Not signed up user connected');

	// user has logged on
	socket.on('newUser', function(userId) {
		// write out on server side the user
		console.log('Logged inuser ID received on server : ' + userId);
		
		// emit new user to all clients
		//
		// PLEASE NOTE:
		// will probably have to change this to emit the list of 
		// items that this user has in their list in order to
		// display it to the other people wanting to buy something
		// from someone who is already logged in
		io.emit('newUser', userId);
	});

	// socket.on('newItem', function(itemData) {
	// 	// tell everyone there's a new item from a logged in user
	// });
});

/**
 * Route for signup functionality for first-time user
 * 
 */
app.post('/signup', function(req, res){
	console.log('inside post method');
	UserDb.findOne({userName: req.body.username}).exec(function(err, user){
		if(!user){
			var u1 = new UserDb({userName: req.body.username,
								password: req.body.password,
								email: req.body.email });
			u1.save(function(err, result) {
				if(err){
					console.log('error while signing up'+err);
					res.json('error while signing up');
				}
				else{
					console.log('user registered successfully');
					res.json('user registered successfully');
				}
			});
		}
		else{
			console.log('user already exists');
			res.json('user already exists, please try again with diffrent user name');
		}
	});
});

/**
 * Route for login functionality for registered user
 * 
 */
app.post('/login', function(req, res){
	console.log('inside post-login method');
	UserDb.findOne({userName: req.body.username1}).exec(function(err, user){
		if(!user){
					console.log('user does not exist'+err);
					res.json({'error':'user does not exist, please sign up first'});
		}
		else{
			    if(user.password !== req.body.password1){
		    			console.log('authentication failure');
						res.json({'error':'authentication failure, please check your details'});
			    }
			    else{
					console.log('user login successful');
					res.json({'username':req.body.username1, 'userid':user._id});
				}
			}	
	});
});

/**
 * Route for functionality to add movies for logged-in user
 * 
 */
app.post('/additems', function(req, res){
	var flagCounter = 0;
	console.log('inside addmovies post method');
	var itemName = req.body.itemName;
	var itemPrice = req.body.itemPrice;
	var itemDescription = req.body.itemName;
	var itemType = req.body.itemName;
	var uName = req.body.userId;

	ItemDb.findOne({itemName: req.body.itemName}).exec(function(err, item){
		if(!item){
			var i1 = new ItemDb({
								itemName: req.body.itemName,
								itemPrice: req.body.itemPrice, 
								itemDescription: req.body.itemDescription,
								itemType: req.body.itemType 
								});
			i1.mUserId.push(uName);
			i1.save(function(err, result) {
				if(err){
					console.log('error while adding item To DB');
					res.json('error while adding item to db');
				}
				else{
					console.log('listing added successfully');
					res.json('listing was added successfully to your List');
				}
			}); //end i1.save function
		} //end-if
		else{
			console.log(item.mUserId.length);
			for(var i=0;i<item.mUserId.length;i++){
				if(item.mUserId[i] === req.body.userId)
				{
					// console.log('movie already exists in user's list');
					console.log(item.mUserId[i]);
					flagCounter++;
				}
				console.log(flagCounter);
			}
			if(flagCounter == 1){
				res.json("listing already exists in your list");
			}
			else{
				item.mUserId.push(req.body.userId);
				item.save(function(err, result) {
					if(err){
						console.log('error while adding item');
						res.json('error while adding listing');
					}
					else{
						console.log('listing added to your list successfully');
						res.json('listing added to your list successfully');
					}
				});
			} //end inner else
		} //end outer else
				}); //end find() function
			// } //end outer else
}); //end post

/**
 * Route for functionality to display all listings for 1 logged-in user 
 * 
 */
app.post('/showListingsFor1User', function(req,res) {
	console.log('in get all listings for 1 user');
	UserDb.findOne({_id: req.body.userID}).exec(function(err, user){
		ItemDb.find({mUserId:user._id},{itemName:1,itemPrice:1,itemDescription:1,itemType:1, _id:0},function(err, items) {
		    if (err) {
		      console.log('error while showing listings for 1 user');
		      res.json('error while showing listings for 1 user');
		    } else {
		      console.log(items);
		      res.json({'username':req.body.username1, 'userid':user._id, 'itemList':items});
		    }
		}); //end find
	}); //end findOne
}); //end post

/**
 * Route for functionality to display all listings on home page
 * 
 */
app.get('/ShowAll', function(req,res) {
	console.log('in get all listings');
	ItemDb.find({},{itemName:1, _id:0, itemPrice: 1, itemDescription: 1}, function(err, items) {
	    if (err) {
	      console.log('error while getting listing');
	      res.json('error while getting listing');
	    } 
	    else {
	      console.log(items);
	      // var movieIndex = movies[Math.floor(Math.random()*movies.length)]; //Function to get one random movie from the database at a time
	      res.json(items);
	    }
	}); //end find
}); //end get