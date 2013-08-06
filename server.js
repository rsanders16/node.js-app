var database = null;
var global_socket = null;
var app = null;
var debug = false;

start_app();
connect_to_database();
start_socket_io();

function start_app() {
	app = require('http').createServer(app_handler), io = require('socket.io')
	.listen(app, {log: debug}), fs = require('fs');

	app.listen(8080);
}

function app_handler(req, res) {
	fs.readFile(__dirname + '/index.html', function(err, data) {
		if (err) {
			res.writeHead(500);
			return res.end('Error loading index.html');
		}

		res.writeHead(200);
		res.end(data);
	});
}

function connect_to_database() {
	var mongo = require('mongodb').MongoClient; //, format = require('util').format;

	mongo.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
		if (err)
			throw err;

		database = db;

		prep_users_collection();
	});
}

function prep_users_collection() {
	database.collection('users').ensureIndex({
		'username' : 1
	}, {
		unique : true
	}, function(err, docs) {
	});
}

function mongodb_response(err, docs) {

	if (err) {
		global_socket.emit('error', {
			error : err
		});

		return false;
	}

	global_socket.emit('output', {
		output : true
	});

	return true;
}

function create_user_db_handler(err, docs) {
	if (err) {
		if (err.code == 11000) {
			global_socket.emit('create_user_error', {
				message : 'Duplicate User'
			});
		}
		return;
	}

	global_socket.emit('create_user_success', {
		id : docs[0]._id,
		username : docs[0].username
	});
}

function read_user_db_handler(err, docs) {
	if (err) {
		global_socket.emit('error', {
			message : 'Error'
		});
		return;
	}

	if (!docs || !docs._id) {
		global_socket.emit('error', {
			message : 'User not found'
		});
		return;
	}

	global_socket.emit('read_user_success', {
		id : docs._id,
		username : docs.username
	});
}

function delete_users_db_handler(err) {
	if (err) {
		global_socket.emit('error', {
			message : 'Error'
		});
		return;
	}

	global_socket.emit('delete_users_success', {
		message : 'all uesrs deleted',
	});
}

function create_user(username, password) {

	if (!username || !password)
		return;

	database.collection('users').insert({
		username : username,
		password : password
	}, create_user_db_handler);
}

function read_user(username) {
	database.collection('users').findOne({
		username : username,
	}, read_user_db_handler);
}

function delete_users() {
	database.collection('users').drop(delete_users_db_handler);
	prep_users_collection();
}

function create_user_socket_listener(params) {
	if (!params || !params.username || !params.password
			|| params.username.length < 3
			|| !params.username.substr(0, 1).match(/[A-Za-z]/)
			|| params.username.length > 20) {
		global_socket.emit('create_user_error', {
			message : 'Argument Missmatch'
		});
		return;
	}
	
	create_user(params.username, params.password);
}

function read_user_socket_listener(params) {

	if (!params || !params.username)
		return;

	read_user(params.username);
}

function delete_users_socket_listener(params) {
	delete_users();
}

function attach_socket_listeners(socket) {
	global_socket = socket;

	socket.on('create_user', create_user_socket_listener);
	socket.on('read_user', read_user_socket_listener);
	socket.on('delete_users', delete_users_socket_listener);
}

function start_socket_io() {
	io.sockets.on('connection', attach_socket_listeners);
}
