/// <reference path="../pb_data/types.d.ts" />

// Public bootstrap endpoint used by the frontend to decide whether the app
// can show login, setup guidance, or authenticated content.
routerAdd("GET", "/api/app/collections", (e) => {
    const all = $app.findAllCollections();
    const names = all
        .filter(c => !c.system && c.type === "base")
        .map(c => c.name);

    let hasUsersAuthCollection = false;

    try {
        const usersCollection = $app.findCollectionByNameOrId("users");
        hasUsersAuthCollection = usersCollection.isAuth();
    } catch (err) {
        console.log(`Users auth collection not found: ${err}`);
    }

    return e.json(200, {
        collections: names,
        hasUsersAuthCollection,
    });
});
