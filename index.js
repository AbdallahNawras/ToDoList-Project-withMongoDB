import express from "express";
import bodyParser from "body-parser";
import mongoose, { Model } from "mongoose";
import _ from "lodash";

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-abdallah:Admin99@cluster0.dwprb3n.mongodb.net/todolistDB");

const itemsSchema = {
    name: String
};

//mongoose Model usully captalized
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: 'Finish H.W'
});
const item2 = new Item({
    name: 'Go to work'
});
const item3 = new Item({
    name: 'Visit friends'
});

const defualtItems = [item1,item2,item3];

app.get("/", async (req,res) => {
    try {
        const foundItems = await Item.find({});
        
        if(foundItems.length === 0) {  //to insert the data only once 
            Item.insertMany(defualtItems);
            res.redirect("/");   // to exit the if statement 
        } else {
            res.render("index.ejs", {listTitle: "Today", tasksForToday: foundItems});
        }        
    }
    catch(error) {
        console.error(error);
    }
});

app.post("/", (req,res) => {
    const itemName = req.body['newItem'];
    const listName = req.body['list'];

    const item = new Item({
        name:itemName
    });

    if(listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName})
        .then((foundList) => {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })   
    };
});

app.post("/delete", async (req,res) => {
    const checkedItemId = req.body['checkbox'];
    const listName = req.body['listName'];

    if(listName === "Today") {       
        await Item.findByIdAndRemove(checkedItemId)
        res.redirect("/");
    } else {
        //Pull from items array an items that has an ID equale to "checkedItemId".
        List.findOneAndUpdate({name: listName }, {$pull: {items: {_id:checkedItemId}}})
        .then((foundList) => {
            res.redirect("/" + listName);
        });
    }
});

const listSchema = {
    name: String,
    items: [itemsSchema]
}
const List = mongoose.model("List", listSchema);

app.get("/:customListName", (req,res) => {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name:customListName})
    .then((foundList) => {
        if(!foundList) {
            const list = new List({
                name: customListName,
                items: defualtItems
            });
            list.save();
            res.redirect("/" + customListName);
        } else {
            res.render("index.ejs", {listTitle: foundList.name, tasksForToday: foundList.items});
        }
    })
    .catch((error) => {
        console.log("ERROR: ❌", error);
    });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

