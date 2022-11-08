// Começamos fazendo as exigências dos pacotes instalados
const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");

// Iniciamos o aplicativo web
const app = express();

// A opção extended diz para o express qual bibliote utilizar para
// fazer o parsing(análise) do conteúdo das requisições que ele recebe;
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

// Informa ao aplicativo web para usar o EJS como mecanismo de vizualização;
app.set('view engine', 'ejs');

/* Banco de dados */ 

//Aqui fica a conexão com o banco de dados
//mongoose.connect("mongodb+srv://<administrador><senha>@cluster0.wi4jp2h.mongodb.net/todolistBD", {useNewUrlParser: true});

const itensSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itensSchema);

const Item1 = new Item({
    name: "Bem vindo a lista de afazeres"
});

const Item2 = new Item({
    name: "Clique no botão '+' para adicionar um item novo"
});

const Item3 = new Item({
    name: "<---- Clique nisso para deletar o item"
});

const defaultItens = [Item1, Item2, Item3];

const listSchema = {
    name: {
        type: String,
        required: [true, "Nome obrigatório"]
    },
    items: [itensSchema]
}

const List = mongoose.model("List", listSchema);

const arrayTeste = [];

// Determina o comportamento da página especificada quando houver alguma
// requisição à página root.
app.get("/", function (req, res) {

    Item.find({}, function (err, results) {
        if (err) {
            console.log(err);
        } else {
            if (results.length === 0) {

                Item.insertMany(defaultItens, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Documentos inseridos com sucesso!");
                    }
                });
                res.redirect("/");

            } else {
                // Utiliza o método render do EJS para renderizar/enviar as propriedades do objeto
                // informado ao list.ejs
                res.render("list", { listTitle: "Today", itens: results });
            }

        }
    });

});

// Determina o comportamento da página ao ser realizada uma requisição POST
app.post("/", function (req, res) {
    const item = req.body.item;
    const listName = req.body.list;

    const newItem = new Item({
        name: item
    });

    if (listName === "Today") {
        newItem.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/listas/" + listName);
        });
    }


});



app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (err) {
                console.log(err);
            } else {
                //console.log("Excluído com sucesso!")
            }
        });

        res.redirect("/");
    } else {
        Item.findOne({name: listName}, function(err, listsName) {
            List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
                if (!err){
                    res.redirect("/listas/" + listName);
                }
            });
        });
    }


});



app.get("/listas/:listName", function (req, res) {

    const nomeLista = _.capitalize(req.params.listName);

    List.findOne({ name: nomeLista }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: nomeLista,
                    items: defaultItens
                });
                list.save();
                res.redirect("/listas/" + nomeLista);
            } else {
                res.render("list.ejs", { listTitle: foundList.name, itens: foundList.items });
            }
        }
    });

});


app.get("/comoUsar", function (req, res) {
    res.render("comoUsar.ejs");
});

app.get("/listas", function(req, res) {
  
const arrayList = [];

List.find({}, function(err, conteudo){
    conteudo.forEach(conteudoLista => {
        arrayList.push(conteudoLista.name);
    });

res.render("listas.ejs", {nomesListas: arrayList});

});
   
});

app.post("/CriarLista", function(req,res) {
    const criarLista = req.body.criarLista;
    res.redirect("/listas/"+criarLista);
});

let port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log("O server foi iniciado com sucesso!");
});
