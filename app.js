
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-AkshatPatel:akshatpatel@cluster0.l6l9a.mongodb.net/todolistDB",{ useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name: "Welcome to your ToDoList!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "<--- Hit this to delete an item."
});
const item4 = new Item({
  name: "HINT: https://infinite-river-54800.herokuapp.com/Akshat | Use your name & Make your personal notes."
});

const defaultItems=[item1,item2,item3,item4];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){

    if (foundItems.length===0) {
      Item.insertMany(defaultItems,function(err){
        if (err) {
          console.log(err);
        }else {
          console.log("Successfully added default item to database.");
        }
        res.redirect("/");
      });
    }else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

  });
});

app.get("/:customListName", function(req,res){
  //console.log(req.params.custom);
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, results) {
      if (!err) {
        if (!results) {
          const list = new List({
            name: customListName,
            items: defaultItems
          });
          list.save(function(err){
            if (!err) {
              res.redirect('/' + customListName);
            }
          });
        } else {
          res.render('list', {listTitle: results.name, newListItems: results.items});
        }
      };
    })
  });


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName==="Today"){
    item.save();
    res.redirect("/");

  }else{
    List.findOne({name: listName},function(err, results){
      results.items.push(item);
      results.save();
      res.redirect("/"+listName);

    });
  }

});

app.post("/delete",function(req, res){
  //console.log(req.body.checkbox);
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("Successfully deleted checked Item.");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, results){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

});


app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started succesfully");
});
