/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_708463716")

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "bool134874966",
    "name": "es_sugerencia",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_708463716")

  // remove field
  collection.fields.removeById("bool134874966")

  return app.save(collection)
})
