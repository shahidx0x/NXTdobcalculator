"use strict";
const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 4005;
const app = express();
const { default: axios } = require("axios");
const HandyStorage = require("handy-storage");
const storage = new HandyStorage("./store.json");
const fs = require("fs");
const format = require("date-fns/format");
const { parseISO } = require("date-fns");

app.use(cors());
app.use(express.json());

const url = "https://timeapi.io/api/Time/current/zone?timeZone=Asia/Dhaka";
axios.get(url).then((res) => {
  storage.setState(res.data);
});

let rawdata = fs.readFileSync("store.json");
let x = JSON.parse(rawdata);
let today = x.dateTime;
let current_date = format(parseISO(today), "yyyy-MM-dd");
let c_date = new Date(current_date);
let current_day = c_date.getDate();
let current_month = c_date.getMonth() + 1;
let current_year = c_date.getUTCFullYear();

app.get("/", (req, res) => {
  res
    .status(200)
    .send(
      `<h2 style="color:red">SERVER STATUS <p style="color:green">[OK]</p> </h2>`
    );
});
app.get("/:isotime", (req, res) => {
  const output = remaingDay(req.params.isotime);
  res.json({ day: output, month: Math.round(output / 30.147) });
});
app.listen(port, () => {
  console.log("[*] Listening to port ", port);
});

function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}
// 1999-01-01T02:00:00Z
function remaingDay(isoDate) {
  let dob_date = new Date(isoDate);
  let dob_day = dob_date.getDate();
  let dob_month = dob_date.getMonth() + 1;
  const calc_birth_year =
    current_month > dob_month
      ? current_year + 1
      : current_month === dob_month
      ? current_year
      : current_month < dob_month
      ? current_year
      : current_year;
  var final_yr = 0,
    final_mon = 0,
    final_day = 0,
    remaining_day = 0,
    chk = 0;
  if (calc_birth_year >= current_year) {
    let temp_yr = calc_birth_year;
    let t_dob_month = dob_month;
    let t_dob_day = dob_day;

    if (t_dob_day < current_day) {
      t_dob_day = t_dob_day + daysInMonth(dob_month, temp_yr);
      final_day = t_dob_day - current_day;
      t_dob_month = t_dob_month - 1;
    } else if (t_dob_day >= current_day) {
      final_day = t_dob_day - current_day;
    }
    if (t_dob_month < current_month) {
      t_dob_month = t_dob_month + 12;
      temp_yr = temp_yr - 1;
      final_mon = t_dob_month - current_month;
    } else if (t_dob_month === current_month) {
      final_mon = 0;
    } else {
      final_mon = t_dob_month - current_month;
    }
  }
  remaining_day = Math.round(final_mon * 30.147 + final_day);
  return remaining_day;
}
