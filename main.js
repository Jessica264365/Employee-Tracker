const inquirer = require("inquirer");
const mysql = require("mysql");
require("console.table");
// const addEmployee = require("./assets/employee");

// creates the connection information for the database
const connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "@gurdy135264365!",
  database: "employeeInfo_db",
});

connection.connect(function (err) {
  if (err) throw err;

  employeeQuesInit();
});

// in .then do an if statement or switch statement (look at activity 9 unit 12: Ice Cream CRUD, Great bay actitivty, two tables activity)
function employeeQuesInit() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "options",
        message: "What would you like to do?",
        choices: [
          "Add employee",
          "Add role",
          "Add department",
          "View departments",
          "View employees",
          "View roles",
          "Update employee role",
          "Update employee manager",
          "Exit",
        ],
      },
    ])
    .then((data) => {
      switch (data.options) {
        case "Add employee":
          addEmployee();
          break;

        case "Add role":
          addRole();
          break;
        case "Add department":
          addDepartment();
          break;
        case "View departments":
          viewDepartment();
          break;
        case "View employees":
          viewEmployees();
          break;
        case "View roles":
          viewRoles();
          break;
        case "Update employee role":
          updateEmployee();
          break;
        case "Update employee manager":
          updateManager();
          break;
        case "Exit":
      }
    });
}

//Function for viewing employees
function viewEmployees() {
  connection.query("SELECT * FROM employee", (err, res) => {
    if (err) throw err;
    console.table(res);
    employeeQuesInit();
  });
}
// Function for viewing departments
function viewDepartment() {
  connection.query("SELECT * FROM department", (err, res) => {
    if (err) throw err;
    console.table(res);
    employeeQuesInit();
  });
}
// Function for viewing roles
function viewRoles() {
  connection.query("SELECT * FROM role", (err, res) => {
    if (err) throw err;
    console.table(res);
    employeeQuesInit();
  });
}
// Function for updating employee information
function updateEmployee() {
  connection.query("SELECT * FROM employee", (err, res) => {
    if (err) throw err;
    console.table(res);
    inquirer
      .prompt([
        {
          type: "input",
          name: "employee_id",
          message: "What is the employee's ID?",
        },
        {
          type: "input",
          name: "newrole_id",
          message: "What is the new role ID?",
        },
      ])
      .then((data) => {
        connection.query(
          "UPDATE employee SET ? WHERE ?",
          [{ role_id: data.newrole_id }, { id: data.employee_id }],
          (err, res) => {
            if (err) throw err;
            console.log(res.affectedRows + " has been updated!\n");
            employeeQuesIntit();
          }
        );
      });
  });
}
// Function for updating manager
function updateManager() {
  connection.query(
    "SELECT * FROM employee WHERE manager_id is NOT NULL; ",
    (err, res) => {
      if (err) throw err;
      console.table(res);
      inquirer
        .prompt([
          {
            type: "input",
            name: "employee_id",
            message: "What is the employee's ID?",
          },
          {
            type: "input",
            name: "newManager_id",
            message: "What is the new manager ID?",
          },
        ])
        .then((data) => {
          connection.query(
            "UPDATE employee SET ? WHERE ?",
            [{ manager_id: data.newManager_id }, { id: data.employee_id }],
            (err, res) => {
              if (err) throw err;
              console.log(res.affectedRows + " has been updated!\n");
              employeeQuesIntit();
            }
          );
        });
    }
  );
}
// Function for adding employee's
function addEmployee() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "first_name",
        message: "What is the employee's first name?",
      },
      {
        type: "input",
        name: "last_name",
        message: "What is the employee's last name?",
      },
      {
        type: "input",
        name: "role_id",
        message: "What is the employee's role ID?",
      },
      {
        type: "input",
        name: "manager_id",
        message: "What is the employee's manager ID?",
      },
    ])
    .then((data) => {
      connection.query(
        "INSERT INTO employee SET ?",
        {
          first_name: data.first_name,
          last_name: data.last_name,
          role_id: data.role_id,
          manager_id: data.manager_id,
        },
        function (err) {
          if (err) throw err;
          console.log("Your employee was added successfully!");
          employeeQuesInit();
        }
      );
    });
}
// Function for adding a new role
function addRole() {
  connection.query(
    "SELECT department.id, department.name, role.title FROM department LEFT JOIN role on department.id = role.department_id;",
    (err, res) => {
      
      if (err) throw err;
      // select all from role
      // connectio.query department table
      let department_ids = res.map((department) => department.id);
      console.log(department_ids);
      console.table(res);
      inquirer
        .prompt([
          {
            type: "input",
            name: "title",
            message: "What is the role title?",
          },
          {
            type: "input",
            name: "salary",
            message: "What is the salary?",
          },
          {
            type: "list",
            name: "department_id",
            message: "What is the department ID for this role?",
            choices: department_ids,
          },
        ])
        .then((data) => {
          connection.query(
            "INSERT INTO role SET ?",
            {
              title: data.title,
              salary: data.salary,
              department_id: data.department_id,
            },
            function (err) {
              if (err) throw err;
              console.log("Your role was added successfully!");
              employeeQuesInit();
            }
          );
        });
    }
  );
}
// Function for adding a new department
function addDepartment() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "name",
        message: "What is the name of the department?",
      },
    ])
    .then((data) => {
      connection.query(
        "INSERT INTO department SET ?",
        {
          name: data.name,
        },
        function (err) {
          if (err) throw err;
          console.log("Your department was added successfully!");
          employeeQuesInit();
        }
      );
    });
}
