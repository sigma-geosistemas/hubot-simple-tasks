hubot-simple-tasks
==================

# Warning

This is a simple hubot tasks module. This is my first time writing a hubot module or a node module.

There are mistakes and there are better ways to to things.

This needs to be refactored, I know.

# Requires

* hubot-redis-brain;

# Usage

* hubot task me <task> - creates a new task for you;
* hubot task @user <task> - creates a new task for @user;
* hubot task list - list all the pending tasks for you;
* hubot task list done - list all the done tasks for you;
* hubot task list @user - list all the pending tasks for @user;
* hubot task list done @user - list all the done tasks for @user;
* hubot task did <taskIndex> - mark task at <taskIndex> as done;
* hubot task did all - mark all tasks as done;
* hubot task clear - delete all done tasks for you;