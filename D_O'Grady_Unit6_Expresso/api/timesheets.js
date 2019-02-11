const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
  db.get('SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId', {$timesheetId: timesheetId},
  function(error, timesheet){
    if (error) {
      next(error);
    } else if (timesheet) {
      next();
    } else {
      res.status(404).send();
    }
  });
});

timesheetsRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Timesheet WHERE Timesheet.employee_id = $employeeId',
  {$employeeId: req.params.employeeId},
    function(error, timesheets){
      if (error) {
        next(error);
      } else {
        res.status(200).json({timesheets: timesheets});
      }
    });
});

timesheetsRouter.post('/', (req, res, next) => {

  const hours = req.body.timesheet.hours;
  const rate = req.body.timesheet.rate;
  const date = req.body.timesheet.date;
  const employeeId = req.params.employeeId;

  db.get('SELECT * FROM Employee WHERE Employee.id = $employeeId', {$employeeId: employeeId},
  function(error,employee){
  if (error){
    next(error);
  }else{
    if(!hours || !rate || !date || !employee) {
    return res.sendStatus(400);
  }

  db.run(`INSERT INTO Timesheet(hours, rate, date, employee_id)
      VALUES($hours, $rate, $date, $employeeId)`,
      {
        $hours: hours,
        $rate: rate,
        $date: date,
        $employeeId: employeeId
      },
    function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`,
        function(error, timesheet){
          res.status(201).json({timesheet: timesheet});
        });
      }
  });
}
});
});


timesheetsRouter.put('/:timesheetId', (req, res, next) => {

  const hours = req.body.timesheet.hours;
  const rate = req.body.timesheet.rate;
  const date = req.body.timesheet.date;
  const employeeId = req.params.employeeId;
  const timesheetId = req.params.timesheetId;

  db.get('SELECT * FROM Employee WHERE Employee.id = $employeeId', {$employeeId: employeeId}, (error, employee) => {
    if (error) {
      next(error);
    } else {
      if (!hours || !rate || !date || !employee) {
        return res.sendStatus(400);
      }

  db.run('UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employeeId WHERE Timesheet.id = $timesheetId',
  {
    $hours: hours,
    $rate: rate,
    $date: date,
    $employeeId: employeeId,
    $timesheetId: timesheetId
  },
  function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`,
        function(error, timesheet){
          res.status(200).json({timesheet: timesheet});
        });
    }
  });
  }
});
});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {

  db.run('Delete FROM Timesheet WHERE Timesheet.id = $timesheetId', {$timesheetId: req.params.timesheetId},
  function(error){
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`,
        (error, timesheet) => {
          res.status(204).json({timesheet: timesheet});
        });
    }
  });
});

module.exports = timesheetsRouter;
