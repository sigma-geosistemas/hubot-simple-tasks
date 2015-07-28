// Description:
// Create and mark tasks to do, done, etc.
// Commands:
// hubot task me <task> - creates a new task for you
// hubot tasks - lists all your pending pending tasks
// hubot tasks <user> - lists all pending tasks for an user
// hubot tasks done - lists all done tasks for you
// hubot tasks <user> done - lists all done tasks for user
// hubot task <task> done - marks task as done
// hubot task help - shows help
// Dependencies:
// hubot-brain
/*jslint node: true*/
module.exports = function(robot) {

	"use strict";

	robot.brain.on("loaded", function(){
		robot.brain.tasks = robot.brain.tasks || {};
	});

	function createTask(res, userName, task) {

		var tasks = getTasks();
		if (!tasks.hasOwnProperty(userName)) {
			res.send("New task list for you!");
			tasks[userName] = {
				pending: [],
				done: []
			};
		}

		tasks[userName].pending.push(task);
		res.send("Don't forget to: " + task + " " + userName);
		updateBrain(tasks);
	}

	function updateBrain(tasks) {
		robot.brain.set("tasks", tasks);
	}

	function getTasks() {
		return robot.brain.get("tasks") || {};
	}

	function getTasksForUser(userName) {
		var tasks = getTasks();
		if (tasks.hasOwnProperty(userName)) {
			return tasks[userName];
		}

		return null;
	}

	function listTasks(userName, done) {

		var tasks = getTasksForUser(userName);

		if (tasks === null) {
			return null;
		}

		if (done) {
			return tasks.done;
		}
		else {
			return tasks.pending;
		}
	}

	robot.respond(/task did (\d+)$/i, function(res){

		var user = res.message.user.name;

		var tasks = getTasks();
		var userTasks = getTasksForUser(user);
		var pendingTasks = listTasks(user, false);

		var taskIndex = Number(res.match[1]);

		if (taskIndex > pendingTasks.length) {
			return res.send("You don't have that much work. Your tasks go just to #" + pendingTasks.length);
		}

		var task = pendingTasks[taskIndex];

		if (task === undefined) {
			return res.send("There is no such thing! Choose a valid index for your task!");
		}

		pendingTasks.splice(taskIndex, 1);
		userTasks.done.push(task);
		tasks[user] = userTasks;
		updateBrain(tasks);
	});

	// lists your pending tasks
	robot.respond(/task list$/i, function(res) {

		var user = res.message.user.name;

		var userTasks = listTasks(user, false);
		if (userTasks === null) {
			return res.send("No task for you!");
		}

		for (var i = 0; i <= userTasks.length -1; i++) {
			var task = userTasks[i];
			res.send("Task #" + i + ": " + task);
		}
		res.send("------------------------------");
		res.send("Total pending: " + userTasks.length);
	});

	robot.respond(/task list (\@\w+)/i, function(res){
		// TODO: tratar nome de usuario
		var user = res.match[1];
		var userTasks = listTasks(user, false);
		if (userTasks === null) {
			return res.send("No task for " + user +"!");
		}

		for (var i = 0; i <= userTasks.length -1; i++) {
			var task = userTasks[i];
			res.send("Task #" + i + ": " + task);
		}
		res.send("------------------------------");
		res.send("Total pending: " + userTasks.length);
	});

	// list your done tasks
	robot.respond(/task list done$/i, function(res){
		var user = res.message.user.name;

		var userTasks = listTasks(user, true);
		if (userTasks === null) {
			return res.send("You haven't completed anything you lazy boy!");
		}

		for (var i = 0; i <= userTasks.length -1; i++) {
			var task = userTasks[i];
			res.send("Task #" + i + ": " + task);
		}
		res.send("------------------------------");
		res.send("Total done: " + userTasks.length);
	});

	// lists done tasks for a certain user
	robot.respond(/task list done (\@\w+)/i, function(res) {
		var user = res.match[1];
		var userTasks = listTasks(user, false);
		if (userTasks === null) {
			return res.send("No task for " + user +"!");
		}

		for (var i = 0; i <= userTasks.length -1; i++) {
			var task = userTasks[i];
			res.send("Task #" + i + ": " + task);
		}
		res.send("------------------------------");
		res.send("Total done: " + userTasks.length);
	});

	// marks of your tasks as done
	robot.respond(/task did all$/i, function(res){

		var user = res.message.user.name;

		var tasks = getTasks();
		var userTasks = getTasksForUser(user);

		var i = 0;

		while (userTasks.pending.length > 0) {
			var task = userTasks.pending.pop();
			userTasks.done.push(task);
			i += 1;
		}

		tasks[user] = userTasks;
		updateBrain(tasks);

		return res.send(i + " tasks marked as completed.");
	});

	// delete all done tasks
	robot.respond(/task clear/i, function(res){
		var user = res.message.user.name;

		var tasks = getTasks();
		var userTasks = getTasksForUser(user);

		var i = 0;

		while (userTasks.done.length > 0) {
			var task = userTasks.done.pop();
			res.send("Deleting: " + task);
			i += 1;
		}

		tasks[user] = userTasks;
		updateBrain(tasks);
		return res.send(i + " tasks deleted.");
	});

	// creates a new task for you
	robot.respond(/task me (.+)/i, function(res){
		var user = res.message.user.name;
		var task = res.match[1];
		createTask(res, user, task);
	});

	// creates a new task for the user
	robot.respond(/task (\@\w+) (.+)/i, function(res){
		var user = res.match[1];
		var task = res.match[2];
		createTask(res, user, task);
	});

	// shows help
	robot.respond(/task help$/i, function(res){
		return res.send("help");
	});
};