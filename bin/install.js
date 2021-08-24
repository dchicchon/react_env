#! /usr/bin/env node
const fs = require("fs");
const shell = require("shelljs");
const path = require("path");
const configFile = path.join(path.dirname(__filename), "../lib/config.json");

// Install to root
const rawData = fs.readFileSync(configFile);
const config = JSON.parse(rawData);
const env = config[config.current];
shell.cd(env.root); // navigate to root to install items there
const flag = process.argv[2];
if (process.argv.length === 2) {
  // install both dependencies and devDependencies from config -> root
  for (const package in env.dependencies) {
    shell.exec(`npm install ${package}`);
  }
  for (const package in env.devDependencies) {
    shell.exec(`npm install ${package} --save-dev`);
  }
} else if (flag === "-dev") {
  for (let i = 3; i < process.argv.length; i++) {
    let package = process.argv[i];
    try {
      shell.exec(`npm install ${package} --save-dev`);
    } catch (error) {
      console.error(error);
    }
  }
  const rootJSON = path.join(process.cwd(), "/package.json");
  const rootFile = fs.readFileSync(rootJSON);
  env.devDependencies = JSON.parse(rootFile).devDependencies;
  const data = JSON.stringify(config);
  fs.writeFile(configFile, data, "utf8", (err) => {
    if (err) console.error(err);
  });
} else {
  for (let i = 2; i < process.argv.length; i++) {
    let package = process.argv[i];
    try {
      shell.exec(`npm install ${package}`);
      // Add it to config
    } catch (error) {
      console.error(error);
    }
  }
  const rootJSON = path.join(process.cwd(), "/package.json");
  const rootFile = fs.readFileSync(rootJSON);
  env.devDependencies = JSON.parse(rootFile).dependencies;
  const data = JSON.stringify(config);
  fs.writeFile(configFile, data, "utf8", (err) => {
    if (err) console.error(err);
  });
}
