/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3875188197")

  // add field
  collection.fields.addAt(4, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_708463716",
    "hidden": false,
    "id": "relation100584999",
    "maxSelect": 10,
    "minSelect": 0,
    "name": "segundos",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_708463716",
    "hidden": false,
    "id": "relation1417288788",
    "maxSelect": 10,
    "minSelect": 0,
    "name": "postres",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(3, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_708463716",
    "hidden": false,
    "id": "relation1542800728",
    "maxSelect": 10,
    "minSelect": 0,
    "name": "primeros",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3875188197")

  // remove field
  collection.fields.removeById("relation100584999")

  // remove field
  collection.fields.removeById("relation1417288788")

  // update field
  collection.fields.addAt(3, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_708463716",
    "hidden": false,
    "id": "relation1542800728",
    "maxSelect": 10,
    "minSelect": 0,
    "name": "field",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
