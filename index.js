var express = require('express')
var path = require('path')
var bodyParser = require('body-parser')
var pg = require('pg')

var app = express()

var config = {
  user: 'testapp', //env var: PGUSER
  database: 'testAppDB', //env var: PGDATABASE
  password: 'imran123', //env var: PGPASSWORD
  host: '127.0.0.1', // Server hosting the postgres database
  port: 5432, //env var: PGPORT
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};

var pool = new pg.Pool(config);

// run a query on the client, and then return the client to the pool
/*pool.connect(function(err, client, done) {
	  if(err) {
    return console.error('error fetching client from pool', err);
  }
  client.query('SELECT $1::int AS number', ['1'], function(err, result) {
    //call `done()` to release the client back to the pool
    done();

    if(err) {
      return console.error('error running query', err);
    }
    console.log(result.rows[0].number);
    //output: 1
  });
	//console.log('connected now');
});*/

pool.on('error', function (err, client) {
  // if an error is encountered by a client while it sits idle in the pool
  // the pool itself will emit an error event with both the error and
  // the client which emitted the original error
  // this is a rare occurrence but can happen if there is a network partition
  // between your application and the database, the database restarts, etc.
  // and so you might want to handle it and at least log it out
  console.error('idle client error', err.message, err.stack)
})
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))
app.set('view engine', 'ejs')
app.set('views', __dirname +'/views');
app.get('/', indexFunc)

function indexFunc(req, res) {
   pool.connect(function(err, client, done) {
    if(err) {
    return console.error('error fetching client from pool', err);
  }
  client.query('SELECT * FROM public.racipe',  function(err, result) {
    //call `done()` to release the client back to the pool
    

    if(err) {
      return console.error('error running query', err);
    }
    var data = result.rows
    res.render('index', {recipe: data})
    
    done();
    //output: 1
  });
  console.log('connected now');
});
	
}
app.get('/recipe/:id', findById)


function findById(req, res) {
  var id = req.params.id;
   pool.connect(function(err, client, done) {
    if(err) {
    return console.error('error fetching client from pool', err);
    }
    var idQuery = "SELECT * FROM racipe WHERE id ="+ id;
    client.query(idQuery,  function(err, result) {
      //call `done()` to release the client back to the pool
      if(err) {
        return console.error('error running query', err);
      }
      var data = result.rows[0]

      res.render('single', {recipe : data})

      done();
      //output: 1
    });

  });
  
}
app.delete('/delete/:id', deleteRecipe)
function deleteRecipe(req, res) {
  console.log("here i am");
  var id = req.params.id;
   pool.connect(function(err, client, done) {
    if(err) {
    return console.error('error fetching client from pool', err);
    }
    var idQuery = "DELETE FROM racipe WHERE id = $1";
    client.query(idQuery,  [id]);
    res.status(200).json("successfully Deleted")
  });
  
}
app.post('/edit/:id', editRecipe)
function editRecipe(req, res){
  console.log('edit');
  
  pool.connect(function(err, client, done) {
      if(err) {
      return console.error('error fetching client from pool', err);
    }
    var recipe = req.body
    recipe.time = recipe.time || 0
   
    var query ='UPDATE racipe SET title=$1, ingredient=$2, process=$3, cooked_by=$4, source=$5,time=$6 WHERE id= $7';
    client.query(query, [
      recipe.title, recipe.ingredient, recipe.process, recipe.cooked_by , recipe.source,recipe.time, req.params.id
    ]);
    done()
    res.redirect('/recipe/'+req.params.id)
  });
}
app.post('/addNew', addNewRecipe)
function addNewRecipe(req, res){
  console.log('add');
  pool.connect(function(err, client, done) {
      if(err) {
      return console.error('error fetching client from pool', err);
    }
    var recipe = req.body
    recipe.time = recipe.time || 0
    client.query('INSERT INTO racipe(title, ingredient, process, cooked_by, source,time) VALUES($1,$2,$3,$4,$5,$6) ', [
      recipe.title, recipe.ingredient, recipe.process, recipe.cooked_by , recipe.source,recipe.time,
    ]);
    done()
    res.redirect('/')
  });
}
app.use(express.static(__dirname+'/public'))
app.listen(3000, function(){
	console.log('server running at port 3000 ...');
})