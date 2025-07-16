/**
 * @author Jörn Kreutel
 *
 * this skript defines the data types used by the application and the model operations for handling instances of the latter
 */

/*************
 * example entity
 *************/

import {mwfUtils} from "vfh-iam-mwf-base";
import {EntityManager} from "vfh-iam-mwf-base";

export class MediaItem extends EntityManager.Entity {

    // TODO-REPEATED: declare entity instance attributes

    constructor(title, src, created) {
        super();
        this.title = title;
        this.src = src;
        this.created = created || Date.now();
    }

}

// TODO-REPEATED: add new entity class declarations here


