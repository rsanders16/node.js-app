var io = require('socket.io-client'), assert = require('assert'), expect = require('expect.js');

describe('Unit Testing Suite', function() {

	var socket = null;

	beforeEach(function(done) {
		// Setup
		socket = io.connect('http://localhost:8080', {
			'reconnection delay' : 0,
			'reopen delay' : 0,
			'force new connection' : true
		});
		socket.on('connect', function() {
			// console.log('worked...');
			done();
		});
		socket.on('disconnect', function() {
			// console.log('disconnected...');
		});
	});

	afterEach(function(done) {
		// Cleanup
		if (socket.socket.connected) {
			// console.log('disconnecting...');
			socket.disconnect();
		} else {
			// There will not be a connection unless you have done() in
			// beforeEach, socket.on('connect'...)
			console.log('no connection to break...');
		}
		done();
	});

	describe('(Users):', function() {
		it('test delete_users', function(done) {
			socket.emit('delete_users');
			socket.on('delete_users_success', function(data) {
				expect(data.message).to.be.equal('all uesrs deleted');
				done();
			});
		});
		it('test create_user', function(done) {
			socket.emit('create_user', {
				username : 'ryansanders',
				password : 'tomtomtomtom'
			});
			socket.on('create_user_success', function(data) {
				expect(data.username).to.be.equal('ryansanders');
				done();
			});
		});
		it('test create_user (duplicate)', function(done) {
			socket.emit('create_user', {
				username : 'ryansanders',
				password : 'tomtomtomtom'
			});
			socket.on('create_user_error', function(data) {
				expect(data.message).to.be.equal('Duplicate User');
				done();
			});
		});
		it('test create_user (username null)', function(done) {
			socket.emit('create_user', {
				username : '',
				password : 'tomtomtomtom'
			});
			socket.on('create_user_error', function(data) {
				expect(data.message).to.be.equal('Argument Missmatch');
				done();
			});
		});

		it('test create_user (username is one char)', function(done) {
			socket.emit('create_user', {
				username : 'x',
				password : 'tomtomtomtom'
			});
			socket.on('create_user_error', function(data) {
				expect(data.message).to.be.equal('Argument Missmatch');
				done();
			});
		});
		it('test create_user (username is two chars)', function(done) {
			socket.emit('create_user', {
				username : 'xx',
				password : 'tomtomtomtom'
			});
			socket.on('create_user_error', function(data) {
				expect(data.message).to.be.equal('Argument Missmatch');
				done();
			});
		});
		it('test create_user (username starts with a non alpha char)',
				function(done) {
					socket.emit('create_user', {
						username : '!xxx',
						password : 'tomtomtomtom'
					});
					socket.on('create_user_error', function(data) {
						expect(data.message).to.be.equal('Argument Missmatch');
						done();
					});
				});
		it('test create_user (username too long)', function(done) {
			socket.emit('create_user', {
				username : 'thisusernameistoolongtouse',
				password : 'tomtomtomtom'
			});
			socket.on('create_user_error', function(data) {
				expect(data.message).to.be.equal('Argument Missmatch');
				done();
			});
		});
	});
});