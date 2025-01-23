import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: "19111991",
  port: 5432,
  });


db.connect();

async function getAllTasks() {
  try {
    const result = await db.query("SELECT * FROM item");
    return result.rows;
  } catch (error) {
    console.error("Error fetching tasks from database:", error);
    throw error;
  }
};

let items = [];

app.get("/", (req, res) => {

  getAllTasks().then(result => {
    items = result;
    console.log(items);

    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
    });

  }).catch(error => {
    console.error("Error:", error);
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: [],
    });
  });
});

app.post("/add", async (req, res) => {
  await db.query("INSERT INTO item (title) VALUES ($1) RETURNING *", [req.body.newItem]);
  getAllTasks();
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  await db.query("UPDATE item SET title = $1 WHERE id = $2", [req.body.updatedItemTitle, req.body.updatedItemId]);
  getAllTasks();
  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  await db.query("DELETE FROM item WHERE id = $1", [req.body.deleteItemId]);
  getAllTasks();
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});