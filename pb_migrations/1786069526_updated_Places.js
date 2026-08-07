/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3457160237")

  // add field
  collection.fields.addAt(7, new Field({
    "help": "",
    "hidden": false,
    "id": "json3482204952",
    "maxSize": 0,
    "name": "Tags",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // update field
  collection.fields.addAt(6, new Field({
    "help": "",
    "hidden": false,
    "id": "select3482204952",
    "maxSelect": 4,
    "name": "Season",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "Spring",
      "Summer",
      "Fall",
      "Winter"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3457160237")

  // remove field
  collection.fields.removeById("json3482204952")

  // update field
  collection.fields.addAt(6, new Field({
    "help": "",
    "hidden": false,
    "id": "select3482204952",
    "maxSelect": 0,
    "name": "Tags",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "dog friendly"
    ]
  }))

  return app.save(collection)
})
