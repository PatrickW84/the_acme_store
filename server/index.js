const {
  client,
  createTables,
  createUser,
  createProduct,
  fetchUsers,
  fetchProducts,
  fetchFavorites,
  createFavorite,
  deleteFavorite,
} = require("./db");

const express = require("express");
const app = express();
app.use(express.json());

app.get("/api/users", async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/products", async (req, res, next) => {
  try {
    res.send(await fetchProducts());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/users/:id/Favorites", async (req, res, next) => {
  try {
    res.send(await fetchFavorites(req.params.id));
  } catch (ex) {
    next(ex);
  }
});

app.delete("/api/users/:userId/Favorites/:id", async (req, res, next) => {
  try {
    await deleteFavorite({ user_id: req.params.userId, id: req.params.id });
    res.sendStatus(204);
  } catch (ex) {
    next(ex);
  }
});

app.post("/api/users/:id/Favorites", async (req, res, next) => {
  try {
    res.status(201).send(
      await createFavorite({
        user_id: req.params.id,
        product_id: req.body.product_id,
      })
    );
  } catch (ex) {
    next(ex);
  }
});

const init = async () => {
  await client.connect();
  console.log("connected to database");
  await createTables();
  console.log("tables created");
  const [wally, bucky, beefguy, nails, milk, gloves, potion] =
    await Promise.all([
      createUser({ username: "wally", password: "s3cr3t" }),
      createUser({ username: "bucky", password: "s3cr3t!!" }),
      createUser({ username: "beefguy", password: "shhh" }),
      createProduct({ name: "nails" }),
      createProduct({ name: "milk" }),
      createProduct({ name: "gloves" }),
      createProduct({ name: "potion" }),
    ]);
  const users = await fetchUsers();
  console.log(users);

  const products = await fetchProducts();
  console.log(products);

  const Favorites = await Promise.all([
    createFavorite({ user_id: wally.id, product_id: nails.id }),
    createFavorite({ user_id: wally.id, product_id: potion.id }),
    createFavorite({ user_id: beefguy.id, product_id: potion.id }),
    createFavorite({ user_id: bucky.id, product_id: milk.id }),
  ]);

  console.log(await fetchFavorites(wally.id));
  await deleteFavorite({ user_id: wally.id, id: Favorites[0].id });
  console.log(await fetchFavorites(wally.id));

  console.log(`curl localhost:3000/api/users/${beefguy.id}/Favorites`);

  console.log(`CURL -X POST localhost:3000/api/users/${bucky.id}/Favorites -d '{"product_id:${nails.id}"}'
      -H 'Content-Type:application/json'`);

  console.log(
    `curl -X DELETE localhost:3000/api/users/${beefguy.id}/Favorites/${Favorites[3].id}`
  );

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};

init();
