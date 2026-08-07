/// <reference path="../pb_data/types.d.ts" />

// Public bootstrap endpoint used by the frontend to decide whether the app
// can show login, setup guidance, or authenticated content.
routerAdd("GET", "/api/app/collections", (e) => {
    try {
        const all = $app.findAllCollections();
        const names = all
            .filter(c => !c.system && c.type === "base")
            .map(c => c.name);
        const fields = {};
        all
            .filter(c => !c.system && c.type === "base")
            .forEach(c => {
                fields[c.name] = c.fields.fieldNames().map(name => {
                    const field = c.fields.getByName(name);
                    const fieldType = typeof field.type === "function" ? field.type() : field.type;
                    return {
                        name,
                        selectOptions: fieldType === "select" ? field.values : [],
                    };
                });
            });

        let hasUsersAuthCollection = false;
        const usersCollection = $app.findCollectionByNameOrId("users");
        hasUsersAuthCollection = usersCollection.isAuth();

        return e.json(200, {
            collections: names,
            fields,
            hasUsersAuthCollection,
        });
    } catch (err) {
        console.log(`Collection bootstrap failed: ${err}`);
        return e.json(500, { error: "Unable to read collection metadata" });
    }
});

routerAdd("GET", "/api/app/installer", (e) => {
    try {
        const installerHash = $os.readFile("/pb/pb_data/installer-url").trim();
        return e.json(200, { installerHash });
    } catch (err) {
        return e.json(404, { installerHash: "" });
    }
});
