const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
  db.get('SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId', {$menuItemId: menuItemId},
  function(error, menuItem){
    if (error) {
      next(error);
    } else if (menuItem) {
      next();
    } else {
      res.status(404).send();
    }
  });
});

menuItemsRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId',{$menuId: req.params.menuId},
    function(error, menuItems){
      if (error) {
        next(error);
      } else {
        res.status(200).json({menuItems: menuItems});
      }
    });
});

menuItemsRouter.post('/', (req, res, next) => {

  const name = req.body.menuItem.name;
  const description = req.body.menuItem.description;
  const inventory = req.body.menuItem.inventory;
  const price = req.body.menuItem.price;
  const menuId = req.params.menuId;



  db.get('SELECT * FROM Menu WHERE Menu.id = $menuId', {$menuId: menuId},
  function(error,menu){
  if (error){
    next(error);
  }else{
    if(!name || !description || !inventory || !price || !menu) {
    return res.sendStatus(400);
  }

  db.run(`INSERT INTO MenuItem (name, description, inventory, price, menu_id)
      VALUES($name, $description, $inventory, $price, $menuId)`,
      {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuId: menuId

      },
    function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`,
        function(error, menuItem){
          res.status(201).json({menuItem: menuItem});
        });
      }
  });
}
});
});

menuItemsRouter.put('/:menuItemId', (req, res, next) => {

  const name = req.body.menuItem.name;
  const description = req.body.menuItem.description;
  const inventory = req.body.menuItem.inventory;
  const price = req.body.menuItem.price;
  const menuId = req.params.menuId;


  db.get('SELECT * FROM Menu WHERE Menu.id = $menuId', {$menuId: menuId}, (error, menu) => {
    if (error) {
      next(error);
    } else {
      if(!name || !description || !inventory || !price || !menu) {
        return res.sendStatus(400);
      }

  db.run(`UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menuId WHERE MenuItem.id = $menuItemId`,
  {
    $name: name,
    $description: description,
    $inventory: inventory,
    $price: price,
    $menuId: menuId,
    $menuItemId: req.params.menuItemId

  },
  function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`,
        function(error, menuItem){
          res.status(200).json({menuItem: menuItem});
        });
    }
  });
}
});
});

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {

  db.run('Delete FROM MenuItem WHERE MenuItem.id = $menuItemId', {$menuItemId: req.params.menuItemId},
  function(error){
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`,
        (error, menuItem) => {
          res.status(204).json({menuItem: menuItem});
        });
    }
  });
});

module.exports = menuItemsRouter;
