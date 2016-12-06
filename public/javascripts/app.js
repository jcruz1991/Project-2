/* jshint browser: true, jquery: true, camelcase: true, indent: 2, undef: true, quotmark: single, maxlen: 80, trailing: true, curly: true, eqeqeq: true, forin: true, immed: true, latedef: true, newcap: true, nonew: true, unused: true, strict: true */

//client side javascript
/* CPSC 473 Project 1: Filmder (Should I watch this?)
 Submitted by- Team- Oscillatory Memorization
 Email- supra.chavan@gmail.com
*/

/**
 * Sign up functionality for first time user
 * Submits sign up form data to server as JSON
 * Input- Username, Email address, password
 * Output- on success, returns JSON message that user is added successfully.
 */

// this variable is required for socket.io
var socket = io.connect('');
var myViewModel;
var biddingViewModel;
var userG = "";

function BiddingViewModel() {
    var self = this;
    self.biddingPrice = ko.observable();
    self.Name = ko.observable();
    self.currentBidPrice = ko.observable();
    self.lastBidder = ko.observable();
    self.newBidPrice = ko.observable();
    self.message = ko.observable();
    self.ID = ko.observable();

    self.submitBtn = function() {

        console.log("submit bidding" + self.newBidPrice());
        var newPrice = self.newBidPrice();
        if (newPrice > self.currentBidPrice()) {
            self.currentBidPrice(self.newBidPrice());
            self.lastBidder(userG);
            self.message("Done!");
            callBidOnItem(self);
        } else {
            self.message("Please enter a bigger price");
        }

    };

    self.currentProduct = function(item) {
        self.Name(item.itemName());
        self.ID(item.itemID());
        self.currentBidPrice(item.itemCurrentBidPrice());
        self.lastBidder(item.itemLastBidder());
        self.newBidPrice(self.currentBidPrice() + 1);
    };

};

function ItemViewModel() {
    var self = this;
    self.itemName = ko.observable("");
    self.itemImage = ko.observable("");
    self.itemPrice = ko.observable("");
    self.itemDescription = ko.observable("");
    self.itemID = ko.observable("");
    self.mUserName = ko.observable("");
    self.itemCurrentBidPrice = ko.observable(0);
    self.itemTotalBids = ko.observable(0);
    self.itemLastBidder = ko.observable("");
    self.isSold = ko.observable(false);
    self.biddingBtn = function() {
        if (userG == "") {
            alert("Please log in first before bidding");
        } else {
            biddingViewModel.currentProduct(self);
            $('.bidding-modal').modal('show');
        }

    };

    self.newItem = function(item) {
        self.itemName(item.itemName);
        self.itemImage('./images/' + item.itemImage);
        self.itemPrice(item.itemPrice);
        self.itemDescription(item.itemDescription);
        self.itemID(item._id);
        self.mUserName(item.mUserName);
        self.itemCurrentBidPrice(item.itemCurrentBidPrice);
        self.itemTotalBids(item.itemTotalBids);
        self.itemLastBidder(item.itemLastBidder);
    };

    self.updateItem = function(item) {
        self.itemCurrentBidPrice(item.itemCurrentBidPrice);
        self.itemLastBidder(item.itemLastBidder);
        self.itemTotalBids(item.itemTotalBids);
    };


};

function AppViewModel() {
    var self = this;
    //List of answers from all users
    self.items = ko.observableArray();

    self.addItem = function(newItem) {
        var item = new ItemViewModel();
        item.newItem(newItem);
        self.items.push(item);
    };

    self.updateAnItem = function(item) {
        //search for the item using the item's id'
        ko.utils.arrayForEach(self.items(), function(i) {
            if (i.itemID() == item._id) {
                i.updateItem(item);
            }
        });
    };
};

function userListViewModel() {
    var self = this;
    self.userItemList = ko.observableArray();

    self.addItemToUserList = function(newItem) {
        var item = new ItemViewModel();
        item.newItem(newItem);
        self.userItemList.push(item);
    };

    // add delete
};


var callSignUpFunction = function() {
    'use strict';
    var uname = document.getElementsByName('uname')[0].value;
    var email = document.getElementsByName('email')[0].value;
    var pwd1 = document.getElementsByName('pwd1')[0].value;
    var jsonStr = JSON.stringify({
        'username': uname,
        'email': email,
        'password': pwd1
    });
    $.ajax({
        type: 'POST',
        data: jsonStr,
        dataType: 'json',
        contentType: 'application/json',
        url: 'http://localhost:3000/signup',
        success: function(data) {
                console.log('success');
                $('.result').html(data);
                $('.signup_form').trigger('reset');
                $('login_modal').modal('destroy');
            } //end success
    }); //end ajax
}; //end function

/**
 * Log in functionality for registered user
 * Submits login form data to server as JSON
 * Input- Username, password
 * Output- on success, diplays user profile,
 * returns user id generated by MongoDB
 */
var callLogInFunction = function() {
    'use strict';
    var ulname = document.getElementsByName('ulname')[0].value;
    var pwd = document.getElementsByName('pwd')[0].value;
    var jsonStr = JSON.stringify({
        'username1': ulname,
        'password1': pwd
    });

    $.ajax({
        type: 'POST',
        data: jsonStr,
        dataType: 'json',
        contentType: 'application/json',
        url: 'http://localhost:3000/login',
        success: function(data) {
                console.log('success');
                if (data.error) {
                    $('.result2').html(data.error);
                    $('.login_form').trigger('reset');
                } else { //successful log in
                    userG = data.username;
                    //emit new user logged in
                    console.log('in here bby');
                    socket.emit('newUser', data.username);

                    $('.result2').html(data);
                    $('.login_form').trigger('reset');
                    $('.login_modal').modal('hide');

                    $('.right_menu1').hide();
                    $('.pointing.label').text(
                        'Welcome ' + data.username);

                    $('.userHeader').text('Welcome ' + data.username);
                    $('.userId').text(data.userid);
                    console.log(data.userid);
                    $('.userId').hide();

                    $('.right_menu2').show();
                    // $('.login_seg').show();
                    // $('.main_seg').hide();
                    // $('.movie_seg').hide();
                    $('.ui.sidebar').sidebar('toggle');
                } //end else
            } //end success
    }); //end ajax
}; //end function

/**
 * Add movies functionality for logged in user
 * Submits  add movies form data to server as JSON
 * Input- Moviename, user id
 * Output- on success, returns JSON message that movie is added successfully.
 */
var callAddItemFunctionOld = function() {
    'use strict';

    var itemName = document.getElementsByName('itemname')[0].value;
    var itemPrice = document.getElementsByName('itemprice')[0].value;
    var itemDescription = $('.itemDescription').val();
    var itemType = $('.selectType option:selected').text();
    var userID = $('span.userId').text();
    console.log(userID);
    console.log('type: ' + itemType);
    var jsonStr = JSON.stringify({
        'itemName': itemName,
        'itemPrice': itemPrice,
        'itemDescription': itemDescription,
        'itemType': itemType,
        'userId': userID
    });
    $.ajax({
        type: 'POST',
        data: jsonStr,
        dataType: 'json',
        contentType: 'application/json',
        url: 'http://localhost:3000/additems',
        success: function(data) {
                // emit new item
                console.log('item added: ' + data.itemName);

                socket.emit('newItemAdded', data);
                console.log(data.itemId);
                $('.result3').html(data);
                $('.additem_form').trigger('reset');
                $('.result3').html();
            } //end success
    }); //end ajax
}; //end function

var callBidOnItem = function(item) {

    var jsonStr = JSON.stringify({
        'itemID': item.ID(),
        'bidPrice': item.currentBidPrice(),
        'userName': item.lastBidder()
    });
    $.ajax({
        type: 'POST',
        data: jsonStr,
        dataType: 'json',
        contentType: 'application/json',
        url: 'http://localhost:3000/bidOnItem',
        success: function(data) {
                // emit item is bid
                console.log(data.Result);
                socket.emit('updateItem', item.ID());
            } //end success
    }); //end ajax

};


var callAddItemFunction = function() {
    'use strict';

    var itemName = document.getElementsByName('itemname')[0].value;
    var itemPrice = document.getElementsByName('itemprice')[0].value;
    var itemBidPrice = document.getElementsByName('itemBidPrice')[0].value;
    var file = $('#image').get(0).files[0];
    var itemDescription = $('.itemDescription').val();
    var itemType = $('.selectType option:selected').text();
    var userID = $('span.userId').text();
    // console.log('file is :' + file);
    // console.log(userID);
    // console.log('type: ' + itemType);
    var formData = new FormData();
    formData.append('itemName', itemName);
    formData.append('itemPrice', itemPrice);

    formData.append('itemDescription', itemDescription);
    formData.append('itemType', itemType);
    formData.append('userId', userID);

    if (itemBidPrice == null) {
        itemBidPrice = 0;
    }
    formData.append('itemBidPrice', itemBidPrice);
    console.log(itemBidPrice);

    if (file != null) {
        formData.append('itemImage', file.name);
        var error = 0;
        if (!file.type.match('image.*')) {
            console.log("<p> Images only. Select another file</p>");
            error = 1;
        } else if (file.size > 1048576) {
            console.log("<p> Too large Payload. Select another file</p>");
            error = 1;
        } else {
            formData.append('image', file, file.name);
        }
    } else {
        formData.append('itemImage', "images.jpeg");
    }


    //console.log(formData.getAll('image')+"rj");

    if (!error) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost:3000/additems', true);
        xhr.send(formData);
        xhr.onload = function() {
            if (xhr.status === 200) {
                console.log('in xhr itemadded success: ');
                var response = JSON.parse(xhr.responseText);
                socket.emit('newItemAdded', response);

                $('.result3').html(xhr.responseText);
                $('.additem_form').trigger('reset');
                $('.result3').html();
            } else {
                console.log("<p> Error in upload, try again.</p>");
            }
        };
    }
};





/**
 * Displays all movies in user's list, for logged in user
 * Input- user id in JSON format as argument jsonStr
 * Output- on success, returns movie information as data
 * with upvotes and downvotes
 */
var callShowListingsFor1User = function(jsonStr) {
    'use strict';
    // $('.movie_seg').empty();
    userListViewModel.userItemList([]);
    ko.utils.arrayForEach(myViewModel.items(), function(i) {
        console.log(i.mUserName());
        if (i.mUserName() == userG) {
            userListViewModel.userItemList.push(i);
        }
    });

    // $.ajax({
    //     type: 'POST',
    //     data: jsonStr,
    //     dataType: 'json',
    //     contentType: 'application/json',
    //     url: 'http://localhost:3000/showListingsFor1User',
    //     success: function(data) {
    //             console.log('success showing listings for One user');
    //             console.log(data.itemList);
    //         for (var i = 0; i < data.itemList.length; i++) {
    //             userListViewModel.addItemToUserList(data.itemList[i]);
    //         }

    //             // for (var i = 0; i < data.itemList.length; i++) {
    //             // // knockout stuff here
    //             //     $('#userItemsListings').append(
    //             //         '<div class="item">' +
    //             //         '<div class="usersItemsListing">' +
    //             //         data.itemList[i].itemName +
    //             //         '<div class="ui buttons">' +
    //             //         '<button class="negative ui button">Delete</button>' +
    //             //         '</div>' +
    //             //         '</div>' +
    //             //         '</div>'
    //             //     );
    //             // }
    //             /*
    //                   console.log('success');
    //                   console.log(jsonStr);
    //                   console.log(JSON.stringify(data));
    //                   console.log(data);
    //                   if (data.error) {
    //                       console.log('error');
    //                   } else {
    //                       console.log(data.itemList.length);
    //                       if (true) {
    //                           for (var i = 0; i < data.itemList.length; i++) {
    //                               console.log(data.itemList[i]);

    //                           } //end for
    //                       } //end if
    //                   } //end else
    //                   */
    //         } //end success
    // }); //end ajax
}; //end function

/**
 * Displays all posted listings
 * Input- None
 * Output- on success, returns listing information as data
 */
var callShowAllListingsFunction = function() {
    'use strict';
    console.log('in ajax get');
    $.ajax({
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json',
        url: 'http://localhost:3000/ShowAll',
        success: function(data) {
                console.log('success');
                console.log(JSON.stringify(data));
                updateItemView(data.itemList);

                // addMovieToHtml(data);
            } //end success
    }); //end ajax
}; //end function

var callGetInfoOfOneItemFunction = function(jsonStr) {
    'use strict';
    $.ajax({
        type: 'POST',
        data: jsonStr,
        dataType: 'json',
        contentType: 'application/json',
        url: 'http://localhost:3000/itemInfo',
        success: function(data) {
                console.log('success');
                myViewModel.updateAnItem(data);
            } //end success
    }); //end ajax
};


var updateItemView = function(itemList) {
    console.log('itemlist inside update itemview is :');
    console.log(itemList);
    for (var i = 0; i < itemList.length; i++) {
        myViewModel.addItem(itemList[i]);
    }
};

var getOnlineUsers = function() {
    $.ajax({
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json',
        url: 'http://localhost:3000/users',
        success: function(users) {
                console.log('getONline success: ');
                for (var i = 0; i < users.length; i++) {
                    $('#onlineUsers').append($('<div class="small header">').text(users[i]));
                }
            } //end success
    }); //end ajax
}


var main = function() {

    myViewModel = new AppViewModel();
    ko.applyBindings(myViewModel, document.getElementById('productList'));

    biddingViewModel = new BiddingViewModel();
    ko.applyBindings(biddingViewModel, document.getElementById('biddingModal'));

    userListViewModel = new userListViewModel();
    ko.applyBindings(userListViewModel, document.getElementById('listOfUsersItems'));


    // maybe change this to getlistings from online
    callShowAllListingsFunction();
    // get users that are online
    getOnlineUsers();

    socket.on('newUser', function(userName) {
        // append to user list?
        // need to add user list
        console.log('user id received on clients: ' + userName);
        $('#onlineUsers').append($('<div class="small header">').text(userName));
    });

    socket.on('newItem', function(item) {
        // NOTE //
        //code to append to current item list goes here //
        var itemList = [item];
        console.log('item in newitem is: ' + item);
        updateItemView(itemList);
    });

    socket.on('userLeft', function(user) {
        var userListElements = document.getElementById('onlineUsers'),
            users = userListElements.getElementsByTagName('div');
        // loop through userList, remove user who left if found
        for (var i = 0; i < users.length; i++) {
            if (users[i].innerText === user) {
                userListElements.removeChild(users[i]);
                return;
            }
        }
    });

    socket.on('updateListing', function() {
        console.log('Update listing');
        callShowAllListingsFunction();
    });

    socket.on('updateItem', function(itemID) {
        console.log('updateItem' + itemID);
        callGetInfoOfOneItemFunction(JSON.stringify({ 'itemID': itemID }));
    });

    $('.right_menu2').hide();
    $('.right_menu1').show();
    $('.ui.sidebar').sidebar('toggle');

    $('.logout').click(function() {
        // socket.emit('logout', userG);
        socket.emit('logout');
        $('.right_menu2').hide();
        $('.right_menu1').show();
        $('.ui.sidebar').sidebar('toggle');
        $('.userHeader').text('');
        // $('.login_seg').hide();
        // $('.main_seg').show();
        $('span.userId').empty();
        // $('.right_menu3').hide();

    });

    $('.profile').click(function() {
        $('.ui.sidebar').sidebar('toggle');
    });

    $('.addItem').click(function() {
        $('.result3').empty();
        $('.additem_modal').modal('show');
        $('.selectType').dropdown();

    });

    $('.viewListing').click(function() {

        var userID = $('span.userId').text();
        var jsonStr = JSON.stringify({
            'userID': userID
        });
        callShowListingsFor1User(jsonStr);
        // $('.movie_seg').show();
    });

    $('.signup').click(function() {
        $('.result').empty();
        $('.signup_modal').modal('show');
    });

    $('.login').click(function() {
        $('.result2').empty();
        $('.login_modal').modal('show');
    });

    $('.login').on('click', function() {
        $('signup_modal').modal('hide');
        $('login_modal').modal('show');
    });

    $('.signup').on('click', function() {
        $('signup_modal').modal('show');
        $('login_modal').modal('hide');
    });

    // Item Modal
    $('.itemsList').on('click', '.product', function() {
        console.log('in product click');
        $('.product_modal').modal('show');
    });


    //Buying Item
    $('.buyItem').on('click', function() {
        alert("Congragulations you just bought an item");
    });


    // Users Listings Modal
    $('.viewUsersListings').on('click', function() {
        $('.usersListings-modal').modal('show');
    });

    $('.login_form').form({
        fields: {
            ulname: {
                identifier: 'ulname',
                rules: [{
                    type: 'empty',
                    prompt: 'Please enter a username'
                }]
            },
            pwd: {
                identifier: 'pwd',
                rules: [{
                    type: 'empty',
                    prompt: 'Please enter a password'
                }]
            },
        }, //end fields
        onSuccess: function(event) {
                callLogInFunction();
                event.preventDefault();
                console.log('form valid');
                $('.result3').empty();
            } //end onSuccess
    }); //end login form validation

    $('.signup_form').form({
        fields: {
            username: {
                identifier: 'uname',
                rules: [{
                    type: 'empty',
                    prompt: 'Please enter a username'
                }]
            },
            email: {
                identifier: 'email',
                rules: [{
                    type: 'email',
                    prompt: 'Please enter a valid email address'
                }, ]
            },
            pwd1: {
                identifier: 'pwd1',
                rules: [{
                    type: 'empty',
                    prompt: 'Please enter a password'
                }, {
                    type: 'length[' + 6 + ']',
                    prompt: 'Your password must be at least 6 characters'
                }]
            },
            pwd2: {
                identifier: 'pwd2',
                rules: [{
                    type: 'empty',
                    prompt: 'Please enter a password'
                }, {
                    type: 'length[' + 6 + ']',
                    prompt: 'Your password must be at least 6 characters'
                }, {
                    type: 'match[pwd1]',
                    prompt: 'Passwords do not match'
                }]
            }
            // chck: {
            //   identifier : 'chck',
            //   rules: [
            //     {
            //       type   : 'checked',
            //       prompt : 'You must agree to the terms and conditions'
            //     }
            //   ]
            // }
        }, //end fields
        onSuccess: function(event) {
                callSignUpFunction();
                event.preventDefault();
                console.log('form valid');
            } //end onSuccess
    }); //end signup form validation

    $('.additem_form').form({
        // $('.result3').html();
        fields: {
            itemname: {
                identifier: 'itemname',
                rules: [{
                    type: 'empty',
                    prompt: 'This field cannot be empty'
                }]
            },
            itemprice: {
                identifier: 'itemprice',
                rules: [{
                    type: 'empty',
                    prompt: 'This field cannot be empty'
                }, {
                type: 'number',
                prompt: 'this field should be numeric value'
                }]
            },
            itemBidPrice: {
                identifier: 'itemBidPrice',
                rules: [{
                    type: 'empty',
                    prompt: 'This field cannot be empty'
                }, {
                type: 'number',
                prompt: 'this field should be numeric value'
                }]
            }
        }, //end fields
        onSuccess: function(event) {
                callAddItemFunction();
                event.preventDefault();
                console.log('form valid');

            } //end onSuccess
    }); //end add item form validation
}; //end main


$(document).ready(main);