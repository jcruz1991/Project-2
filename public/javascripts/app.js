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
                console.log(jsonStr);
                console.log(JSON.stringify(data));
                console.log(data);
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
                console.log(jsonStr);
                console.log(JSON.stringify(data));


                if (data.error) {
                    $('.result2').html(data.error);
                    $('.login_form').trigger('reset');
                } else { //successful log in

                    //emit new user logged in
                    console.log('in here bby');
                    socket.emit('newUser', data.userid);

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
var callAddItemFunction = function() {
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
                socket.emit('newItemAdded', data.itemId );
                console.log(data.itemId);
                $('.result3').html(data);
                $('.additem_form').trigger('reset');
                $('.result3').html();
            } //end success
    }); //end ajax
}; //end function

/**
 * Displays all movies in user's list, for logged in user
 * Input- user id in JSON format as argument jsonStr
 * Output- on success, returns movie information as data
 * with upvotes and downvotes
 */
var callShowListingsFor1User = function(jsonStr) {
    'use strict';
    // $('.movie_seg').empty();
    $.ajax({
        type: 'POST',
        data: jsonStr,
        dataType: 'json',
        contentType: 'application/json',
        url: 'http://localhost:3000/showListingsFor1User',
        success: function(data) {
                console.log('success');
                console.log(jsonStr);
                console.log(JSON.stringify(data));
                console.log(data);
                if (data.error) {
                    console.log('error');
                } else {
                    console.log(data.itemList.length);
                    if (true) {
                        for (var i = 0; i < data.itemList.length; i++) {
                            console.log(data.itemList[i]);

                        } //end for
                    } //end if
                } //end else
            } //end success
    }); //end ajax
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
                console.log(data);
                for(var i=0;i<data.itemList.length;i++)
                {
                    $('.itemsList').append('<div class="ui product card">'+
                        '<a class="image" href="#">'+
                            '<img src="http://placehold.it/320x150" alt="">'+
                        '</a>'+
                        '<div class="content">'+
                            '<a class="header">'+data.itemList[i].itemName+'</a>'+
                            '<div class="meta">'+
                                '<a><h3>Price : '+data.itemList[i].itemPrice+'</h3></a>'+
                                '<div class="description">Description : '+
                                    data.itemList[i].itemDescription+
                                '</div>'+
                                '<div class="postedBy">Posted By : '+data.itemList[i].mUserName+
                            '</div>'+
                        '</div>'+
                        // '<div class="extra content">'+
                        //   '<span class="right floated">'+
                        //     'Posted By : '+data.itemList[i].mUserName+
                        //   '</span>'+
                        //   '<span>'+
                        //     '<i class="user icon"></i>
                        //     35 Friends
                        //   </span>
                        // </div>
                    '</div>');
                }
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
                console.log(JSON.stringify(data));
                console.log(data);
                // addMovieToHtml(data);
            } //end success
    }); //end ajax
};


var main = function() {

    callShowAllListingsFunction();

    socket.on('newUser', function(userData) {
        // append to user list?
        // need to add user list
        console.log('user id received on clients: ' + userData);
    });

    socket.on('newItem', function(item){
      // NOTE //
      //code to append to current item list goes here //
    });


    socket.on('updateAnItem', function(itemName) {
        console.log('Update display for ' + itemName);
        callGetInfoOfOneItemFunction({ 'itemName': itemName });
    });

    socket.on('updateListing', function() {
        console.log('Update listing');
        callShowAllListingsFunction();
    });

    $('.right_menu2').hide();
    $('.right_menu1').show();
    $('.ui.sidebar').sidebar('toggle');

    $('.logout').click(function() {

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
    $('.itemsList').on('click', '.product',function() {
        console.log('in product click');
        $('.product_modal').modal('show');
    });

    // Bidding Modal
    $('.bid').on('click', function() {
        $('.bidding-modal').modal('show');
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
