const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const controllerPath = path.resolve(__dirname, 'submissionController.js');
const taskModelPath = path.resolve(__dirname, '../models/Task.js');
const submissionModelPath = path.resolve(__dirname, '../models/Submission.js');

const loadController = ({ Task, Submission }) => {
  const originals = new Map([
    [controllerPath, require.cache[controllerPath]],
    [taskModelPath, require.cache[taskModelPath]],
    [submissionModelPath, require.cache[submissionModelPath]],
  ]);

  delete require.cache[controllerPath];
  require.cache[taskModelPath] = {
    id: taskModelPath,
    filename: taskModelPath,
    loaded: true,
    exports: Task,
  };
  require.cache[submissionModelPath] = {
    id: submissionModelPath,
    filename: submissionModelPath,
    loaded: true,
    exports: Submission,
  };

  const controller = require(controllerPath);

  return {
    controller,
    restore() {
      delete require.cache[controllerPath];
      for (const [cachePath, original] of originals) {
        if (original) {
          require.cache[cachePath] = original;
        } else {
          delete require.cache[cachePath];
        }
      }
    },
  };
};

const createResponse = () => ({
  statusCode: 200,
  body: undefined,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

test('submitTask rejects submissions for tasks assigned to another talent', async () => {
  let createdSubmission = false;
  let updatedTask = false;
  const { controller, restore } = loadController({
    Task: {
      findById: async () => ({ _id: 'task-1', assignedTo: 'talent-2' }),
      findByIdAndUpdate: async () => {
        updatedTask = true;
      },
    },
    Submission: {
      findOne: async () => null,
      create: async () => {
        createdSubmission = true;
        return { _id: 'submission-1' };
      },
    },
  });

  try {
    const req = {
      params: { taskId: 'task-1' },
      body: { notes: 'attempted takeover' },
      user: { _id: 'talent-1', role: 'Talent' },
    };
    const res = createResponse();

    await controller.submitTask(req, res);

    assert.equal(res.statusCode, 403);
    assert.equal(createdSubmission, false);
    assert.equal(updatedTask, false);
  } finally {
    restore();
  }
});

test('submitTask allows a talent to submit their assigned task', async () => {
  let updatedTaskStatus;
  const submission = { _id: 'submission-1', taskId: 'task-1', talentId: 'talent-1' };
  const { controller, restore } = loadController({
    Task: {
      findById: async () => ({ _id: 'task-1', assignedTo: 'talent-1' }),
      findByIdAndUpdate: async (taskId, update) => {
        assert.equal(taskId, 'task-1');
        updatedTaskStatus = update.status;
      },
    },
    Submission: {
      findOne: async () => null,
      create: async (payload) => {
        assert.deepEqual(payload, {
          taskId: 'task-1',
          talentId: 'talent-1',
          fileUrl: null,
          notes: 'done',
        });
        return submission;
      },
    },
  });

  try {
    const req = {
      params: { taskId: 'task-1' },
      body: { notes: 'done' },
      user: { _id: 'talent-1', role: 'Talent' },
    };
    const res = createResponse();

    await controller.submitTask(req, res);

    assert.equal(res.statusCode, 201);
    assert.equal(res.body, submission);
    assert.equal(updatedTaskStatus, 'Submitted');
  } finally {
    restore();
  }
});

test('authorizeTaskSubmission blocks unassigned tasks before upload processing', async () => {
  let nextCalled = false;
  const { controller, restore } = loadController({
    Task: {
      findById: async () => ({ _id: 'task-1', assignedTo: 'talent-2' }),
    },
    Submission: {},
  });

  try {
    const req = {
      params: { taskId: 'task-1' },
      user: { _id: 'talent-1', role: 'Talent' },
    };
    const res = createResponse();

    await controller.authorizeTaskSubmission(req, res, () => {
      nextCalled = true;
    });

    assert.equal(res.statusCode, 403);
    assert.equal(nextCalled, false);
  } finally {
    restore();
  }
});

test('authorizeTaskSubmission passes assigned tasks to the upload middleware', async () => {
  let nextCalled = false;
  const assignedTask = { _id: 'task-1', assignedTo: 'talent-1' };
  const { controller, restore } = loadController({
    Task: {
      findById: async () => assignedTask,
    },
    Submission: {},
  });

  try {
    const req = {
      params: { taskId: 'task-1' },
      user: { _id: 'talent-1', role: 'Talent' },
    };
    const res = createResponse();

    await controller.authorizeTaskSubmission(req, res, () => {
      nextCalled = true;
    });

    assert.equal(res.statusCode, 200);
    assert.equal(req.task, assignedTask);
    assert.equal(nextCalled, true);
  } finally {
    restore();
  }
});

test('getSubmission scopes talent reads to their own submission', async () => {
  let query;
  const { controller, restore } = loadController({
    Task: {},
    Submission: {
      findOne: (nextQuery) => {
        query = nextQuery;
        return {
          populate: async () => ({ _id: 'submission-1' }),
        };
      },
    },
  });

  try {
    const req = {
      params: { taskId: 'task-1' },
      user: { _id: 'talent-1', role: 'Talent' },
    };
    const res = createResponse();

    await controller.getSubmission(req, res);

    assert.deepEqual(query, { taskId: 'task-1', talentId: 'talent-1' });
    assert.equal(res.statusCode, 200);
  } finally {
    restore();
  }
});

test('getSubmission keeps admin access to any task submission', async () => {
  let query;
  const { controller, restore } = loadController({
    Task: {},
    Submission: {
      findOne: (nextQuery) => {
        query = nextQuery;
        return {
          populate: async () => ({ _id: 'submission-1' }),
        };
      },
    },
  });

  try {
    const req = {
      params: { taskId: 'task-1' },
      user: { _id: 'admin-1', role: 'Admin' },
    };
    const res = createResponse();

    await controller.getSubmission(req, res);

    assert.deepEqual(query, { taskId: 'task-1' });
    assert.equal(res.statusCode, 200);
  } finally {
    restore();
  }
});
