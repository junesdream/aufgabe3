/**
 * Updated by master on 21.02.24.
 */
import {mwf} from "vfh-iam-mwf-base";
import {EntityManager} from "vfh-iam-mwf-base";
import {GenericCRUDImplLocal} from "vfh-iam-mwf-base";
import {GenericCRUDImplRemote} from "vfh-iam-mwf-base";
import * as entities from "./model/MyEntities.js";

class MyApplication extends mwf.Application {

    constructor() {
        super();
    }

    async oncreate() {
        console.log("MyApplication.oncreate(): calling supertype oncreate");

        // first call the supertype method and pass a callback
        await super.oncreate();

        console.log("MyApplication.oncreate(): initialising local database");
        // initialise the local database
        await GenericCRUDImplLocal.initialiseDB("mwftutdb", 1, ["MediaItem"]);

        console.log("MyApplication.oncreate(): local database initialised");

        // register entities and crud operations for the entity types
        this.registerEntity("MediaItem", entities.MediaItem, true);
        this.registerCRUD("MediaItem", this.CRUDOPS.LOCAL, GenericCRUDImplLocal.newInstance("MediaItem"));
        this.registerCRUD("MediaItem", this.CRUDOPS.REMOTE, GenericCRUDImplRemote.newInstance("MediaItem"));

        // THIS MUST NOT BE FORGOTTEN: initialise the entity manager!
        EntityManager.initialise();
    };
}

const application = new MyApplication();
export {application as default}