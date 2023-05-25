const fs = require("fs");
const os = require("os");
const path = require("path");

const figlet = require("figlet");
const chalk = require("chalk");
const prompts = require("prompts");

const introduce = "\nThis CLI makes changing windows host easy.\n";
const hostFilePath = "C:\\Windows\\System32\\drivers\\etc\\hosts";

const ipRegex =
  /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

const questions = [
  {
    type: "text",
    name: "ip",
    message: "enter the ip to add:",
  },
  {
    type: "text",
    name: "domain",
    message: "enter the domain to add:",
  },
];

if (os.platform() !== "win32") {
  console.log(chalk.red("this cli only run windows!"));
  return;
}

figlet.text(
  "Easy Window Host!",
  {
    font: "Star Wars",
    horizontalLayout: "default",
    verticalLayout: "default",
    width: 80,
    whitespaceBreak: true,
  },
  function (err, data) {
    if (err) {
      console.log("Something went wrong...");
      console.dir(err);
      return;
    }
    console.log(data);
    console.log(introduce);

    (async () => {
      const response = await prompts(questions);

      const { ip, domain } = response;

      if (!ipRegex.test(ip)) {
        console.log(chalk.red("not valid ip address"));
        return;
      }

      const hostFile = fs.readFileSync(hostFilePath).toString();

      const user = os.userInfo();
      const backupPath = path.resolve(user.homedir, "hosts_bak");

      try {
        fs.writeFileSync(backupPath, hostFile);
        console.log(
          chalk.green(
            `successfully backup your host file at your home directory: ${backupPath}`
          )
        );
      } catch (err) {
        console.log(chalk.red("error when write your host backup file"));
      }

      try {
        fs.appendFileSync(hostFilePath, `${ip}\t${domain}\n`);
        console.log(chalk.green("successfully edit your host file"));
        try {
          fs.unlinkSync(backupPath);

          console.log(chalk.green("successfully remove your host backup file"));
        } catch (err) {
          console.log(chalk.red("error when remove your host backup file"));
          console.log("remove your host backup file");
        }
      } catch (err) {
        console.log(chalk.red("error when write your host file"));
        console.log(`replace your host backup file: ${backupPath}`);
      }
    })();
  }
);
