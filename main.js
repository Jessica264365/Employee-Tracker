const inquirer = require("inquirer");
const mysql = require("mysql");
require("console.table");

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

// initial question prompt
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
          exit();
          break;
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
  connection.query(
    "SELECT role.id, title, first_name, last_name, employee.id, employee.role_id FROM role LEFT JOIN employee on role.id = employee.role_id;",
    (err, res) => {
      if (err) throw err;
      let employee_ids = res.map(({ id, first_name, last_name }) => ({
        name: first_name + " " + last_name,
        value: id,
      }));
      let role_ids = res.map(({ role_id, title }) => ({
        name: title,
        value: role_id,
      }));
      console.table(res);
      inquirer
        .prompt([
          {
            type: "list",
            name: "employee_id",
            message: "What is the employee's name?",
            choices: employee_ids,
          },
          {
            type: "list",
            name: "newrole_id",
            message: "What is the new role title?",
            choices: role_ids,
          },
        ])
        .then((data) => {
          connection.query(
            "UPDATE employee SET ? WHERE ?",
            [{ role_id: data.newrole_id }, { id: data.employee_id }],
            (err, res) => {
              if (err) throw err;
              console.log(res.affectedRows + " has been updated!\n");
              employeeQuesInit();
            }
          );
        });
    }
  );
}
// Function for updating manager
function updateManager() {
  let update_manager = {
    manager_id: null,
    id: null,
  };
  connection.query("SELECT * FROM employee; ", (err, res) => {
    if (err) throw err;
    let employee_ids = res.map(({ id, first_name }) => ({
      name: first_name,
      value: id,
    }));

    console.table(res);
    inquirer
      .prompt({
        type: "list",
        name: "employee_id",
        message: "What is the employee's name?",
        choices: employee_ids,
      })
      .then((data) => {
        console.log(data);
        update_manager.id = data.employee_id;
        connection.query(
          "SELECT DISTINCT managers.id, managers.first_name, managers.last_name FROM employee JOIN employee as managers ON employee.manager_id = managers.id ORDER BY managers.last_name ASC;",
          (err, res) => {
            if (err) throw err;
            let manager_ids = res.map(({ id, first_name }) => ({
              name: first_name,
              value: id,
            }));
            inquirer
              .prompt([
                {
                  type: "list",
                  name: "newManager_id",
                  message: "What is the new manager ID?",
                  choices: manager_ids,
                },
              ])
              .then((data) => {
                update_manager.manager_id = data.newManager_id;
                connection.query(
                  "UPDATE employee SET ? WHERE ?",
                  [
                    { manager_id: update_manager.manager_id },
                    { id: update_manager.id },
                  ],
                  (err, res) => {
                    if (err) throw err;
                    console.log(res.affectedRows + " has been updated!\n");
                    employeeQuesInit();
                  }
                );
              });
          }
        );
      });
  });
}
// Function for adding employees
function addEmployee() {
  connection.query("SELECT * FROM role", (err, res) => {
    if (err) throw err;
    let role_ids = res.map(({ id, title }) => ({
      name: title,
      value: id,
    }));
    connection.query(
      "SELECT DISTINCT managers.id, managers.first_name, managers.last_name FROM employee JOIN employee as managers ON employee.manager_id = managers.id ORDER BY managers.last_name ASC;",
      (err, res) => {
        let manager_ids = res.map(({ id, first_name }) => ({
          name: first_name,
          value: id,
        }));

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
              type: "list",
              name: "role_id",
              message: "What is the employee's role?",
              choices: role_ids,
            },
            {
              type: "list",
              name: "isManager",
              message: "Is the employee a manager?",
              choices: ["Yes", "No"],
            },
            // if the employee isn't a manager the user is asked who the manager will be
            {
              type: "list",
              name: "manager_id",
              message: "Who is the employee's manager?",
              when: (answers) => answers.isManager === "No",
              choices: manager_ids,
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
    );
  });
}
// Function for adding a new role
function addRole() {
  connection.query("SELECT * FROM employeeinfo_db.department;", (err, res) => {
    if (err) throw err;
    let department_ids = res.map(({ id, name }) => ({
      name: name,
      value: id,
    }));

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
  });
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
// Function for exiting the application
function exit() {
  process.exit();
}
