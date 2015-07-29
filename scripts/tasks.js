// Description:
// Create and mark tasks to do, done, etc.
// Commands:
// hubot task me <task> - creates a new task for you;
// hubot task @user <task> - creates a new task for @user;
// hubot task list - list all the pending tasks for you;
// hubot task list done - list all the done tasks for you;
// hubot task list @user - list all the pending tasks for @user;
// hubot task list done @user - list all the done tasks for @user;
// hubot task did <taskIndex> - mark task at <taskIndex> as done;
// hubot task did all - mark all tasks as done;
// hubot task clear - delete all done tasks for you;
// Dependencies:
// hubot-redis-brain
/*jslint node: true*/
module.exports = function(robot) {

	"use strict";

	robot.brain.on("loaded", function(){
		robot.brain.tasks = robot.brain.tasks || {};
	});

	function createTask(res, userName, task) {

		var tasks = getTasks();
		if (!tasks.hasOwnProperty(userName)) {
			res.reply("New task list for " + userName + "!");
			tasks[userName] = {
				pending: [],
				done: []
			};
		}

		tasks[userName].pending.push(task);
		res.reply("Don't forget to: " + task + " " + userName);
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

	function getUser(userName) {

		// removing the @ from username
		userName = userName.substring(1);

		var users = robot.brain.usersForFuzzyName(userName);
		
		if (users.length <= 0) {
			return null;
		}
		if (users.length > 1) {
			return null;
		}

		return users[0].name;
	}

	robot.respond(/task did (\d+)$/i, function(res){

		var user = res.message.user.name;

		var tasks = getTasks();
		var userTasks = getTasksForUser(user);
		var pendingTasks = listTasks(user, false);

		var taskIndex = Number(res.match[1]);

		if (taskIndex > pendingTasks.length) {
			return res.reply("You don't have that much work. Your tasks go just to #" + pendingTasks.length);
		}

		var task = pendingTasks[taskIndex];

		if (task === undefined) {
			return res.reply("There is no such thing! Choose a valid index for your task!");
		}

		pendingTasks.splice(taskIndex, 1);
		userTasks.done.push(task);
		tasks[user] = userTasks;
		res.reply("Uhul, another task done!");
		updateBrain(tasks);
	});

	// lists your pending tasks
	robot.respond(/task list$/i, function(res) {

		var user = res.message.user.name;

		var userTasks = listTasks(user, false);
		if (userTasks === null) {
			return res.reply("No task for you!");
		}

		res.reply("------------------------------");
		res.reply("Tasks for " + user);

		for (var i = 0; i <= userTasks.length -1; i++) {
			var task = userTasks[i];
			res.reply("Task #" + i + ": " + task);
		}
		res.reply("------------------------------");
		res.reply("Total pending: " + userTasks.length);
	});

	robot.respond(/task list (\@\w+)/i, function(res){
		
		var userName = res.match[1].trim();
		var user = getUser(userName);

		if (user === null || user === undefined) {
			return res.reply("No user with name " + userName + "!");
		}

		var userTasks = listTasks(user, false);
		if (userTasks === null) {
			return res.reply("No task for " + user +"!");
		}

		res.reply("------------------------------");
		res.reply("Tasks for " + user);

		for (var i = 0; i <= userTasks.length -1; i++) {
			var task = userTasks[i];
			res.reply("Task #" + i + ": " + task);
		}
		res.reply("------------------------------");
		res.reply("Total pending: " + userTasks.length);
	});

	// list your done tasks
	robot.respond(/task list done$/i, function(res){
		
		var user = res.message.user.name;

		var userTasks = listTasks(user, true);
		if (userTasks === null) {
			return res.reply("You haven't completed anything you lazy boy!");
		}

		res.reply("------------------------------");
		res.reply("Tasks done by " + user);

		for (var i = 0; i <= userTasks.length -1; i++) {
			var task = userTasks[i];
			res.reply("Task #" + i + ": " + task);
		}
		res.reply("------------------------------");
		res.reply("Total done: " + userTasks.length);
	});

	// lists done tasks for a certain user
	robot.respond(/task list done (\@\w+)/i, function(res) {

		var userName = res.match[1].trim();
		var user = getUser(userName);

		if (user === null || user === undefined) {
			return res.reply("No user with name " + userName + "!");
		}

		var userTasks = listTasks(user, true);
		if (userTasks === null) {
			return res.reply("No task for " + user +"!");
		}
		
		res.reply("------------------------------");
		res.reply("Tasks done by " + user);

		for (var i = 0; i <= userTasks.length -1; i++) {
			var task = userTasks[i];
			res.reply("Task #" + i + ": " + task);
		}
		res.reply("------------------------------");
		res.reply("Total done: " + userTasks.length);
	});

	// marks of your tasks as done
	robot.respond(/task did all$/i, function(res){

		var user = res.message.user.name;

		var tasks = getTasks();
		var userTasks = getTasksForUser(user);

		var i = 0;

		while (userTasks.pending.length > 0) {
			var task = userTasks.pending.shift();
			userTasks.done.push(task);
			i += 1;
		}

		tasks[user] = userTasks;
		updateBrain(tasks);

		return res.reply(i + " tasks marked as completed.");
	});

	// delete all done tasks
	robot.respond(/task clear/i, function(res){
		var user = res.message.user.name;

		var tasks = getTasks();
		var userTasks = getTasksForUser(user);

		var i = 0;

		while (userTasks.done.length > 0) {
			var task = userTasks.done.shift();
			res.reply("Deleting: " + task);
			i += 1;
		}

		tasks[user] = userTasks;
		updateBrain(tasks);
		return res.reply(i + " tasks deleted.");
	});

	// creates a new task for you
	robot.respond(/task me (.+)/i, function(res){
		var user = res.message.user.name;
		var task = res.match[1];
		createTask(res, user, task);
	});

	// creates a new task for the user
	robot.respond(/task (\@\w+) (.+)/i, function(res){
		var userName = res.match[1].trim();
		var user = getUser(userName);

		if (user === null || user === undefined) {
			return res.reply("No user with name " + userName + "!");
		}

		var task = res.match[2];
		createTask(res, user, task);
	});
};